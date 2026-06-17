import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import useAuthStore from '../../../store/authStore'
import { getHistorialMensajes } from '../services/chatService'
import { getIntercambio } from '../services/solicitudService'
import { useChatSocket } from '../hooks/useChatSocket'

import ChatHeader from '../components/chat/ChatHeader'
import ReconnectBanner from '../components/chat/ReconnectBanner'
import ChatMessageList from '../components/chat/ChatMessageList'
import ChatInput from '../components/chat/ChatInput'
import ChatClosedBanner from '../components/chat/ChatClosedBanner'

export default function ChatView({ exchangeId: propId, onBack, exchange: propExchange } = {}) {
  const params = useParams()
  const id = propId ?? params.id
  const { user, token } = useAuthStore()

  // ── Estado de mensajes ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [exchangeStatus, setExchangeStatus] = useState(null)
  const [exchange, setExchange] = useState(propExchange ?? null)

  // ── Estado de paginación ─────────────────────────────────────────────
  const [hasMore, setHasMore] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)

  // ── Refs ───────────────────────────────────────────────────────────────────
  const bottomRef = useRef(null)
  // Ref al div scrollable del chat — lo maneja ChatMessageList vía prop
  const chatContainerRef = useRef(null)
  // Cursor: _id del mensaje más antiguo ya cargado
  const oldestIdRef = useRef(null)
  // Guardamos scrollHeight antes del prepend para restaurar la posición
  const prevScrollHeightRef = useRef(null)
  // Rastrea si el usuario está en el fondo del scroll
  const isAtBottomRef = useRef(true)

  // El chat solo acepta mensajes si el intercambio está activo
  const isChatActive = exchangeStatus === 'active'

  // ── Socket ─────────────────────────────────────────────────────────────────
  const handleSocketMessage = useCallback((msg) => {
    setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg])
  }, [])

  // Conectar el socket en paralelo con el REST (no esperar isChatActive)
  // El backend rechaza el chat:join si el intercambio no está activo
  const { connected, chatEnabled, connError, sendMessage } = useChatSocket(
    error ? null : id,
    handleSocketMessage,
  )

  // ── H6.4: Historial REST (carga inicial — solo los 20 más recientes) ───────
  const fetchMessages = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    setRetrying(false)
    oldestIdRef.current = null
    setHasMore(false)
    try {
      const data = await getHistorialMensajes(id, { limit: 20 })
      const msgs = data.messages ?? []
      setMessages(msgs)
      setHasMore(data.hasMore ?? false)
      setExchangeStatus(data.exchangeStatus ?? null)
      // Cursor inicial = _id del mensaje más antiguo de la primera página
      if (msgs.length > 0) {
        oldestIdRef.current = msgs[0]._id
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) setError('No tenés permisos para ver este chat, o el intercambio no está activo.')
      else if (status === 404) setError('Este intercambio no existe.')
      else setError('No se pudo cargar el chat. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  // Si llega un exchange por prop (desde la sidebar), sincronizarlo con el estado.
  // Si no hay prop, cargarlo desde la API (ruta standalone /intercambios/:id/chat).
  useEffect(() => {
    if (propExchange) {
      setExchange(propExchange)
    } else if (id) {
      getIntercambio(id).then(setExchange).catch(() => { })
    }
  }, [id, propExchange])

  // ── H6.4: Cargar mensajes más antiguos (prepend) ───────────────────────────
  const cargarMensajesAntiguos = useCallback(async () => {
    if (loadingOlder || !hasMore || !oldestIdRef.current) return

    // Guardar la altura actual ANTES del prepend para restaurar el scroll después
    prevScrollHeightRef.current = chatContainerRef.current?.scrollHeight ?? 0
    setLoadingOlder(true)

    try {
      const data = await getHistorialMensajes(id, { before: oldestIdRef.current, limit: 20 })
      const nuevos = data.messages ?? []

      if (nuevos.length === 0) {
        setHasMore(false)
      } else {
        // PREPEND: los mensajes viejos van antes que los actuales
        setMessages(prev => [...nuevos, ...prev])
        setHasMore(data.hasMore ?? false)
        // Actualizar cursor al mensaje más antiguo recién cargado
        oldestIdRef.current = nuevos[0]._id
      }
    } catch {
      toast.error('Error al cargar mensajes anteriores')
      // Resetear prevScrollHeight para no corromper el scroll en siguientes renders
      prevScrollHeightRef.current = null
    } finally {
      setLoadingOlder(false)
    }
  }, [id, loadingOlder, hasMore])

  // ── Preservar posición del scroll después del prepend ───────────────
  // useLayoutEffect corre de forma sincrónica DESPUÉS de que React actualizó el DOM
  // pero ANTES de que el navegador pinte — momento exacto para ajustar scrollTop.
  useLayoutEffect(() => {
    if (prevScrollHeightRef.current !== null && chatContainerRef.current) {
      const delta = chatContainerRef.current.scrollHeight - prevScrollHeightRef.current
      chatContainerRef.current.scrollTop = delta
      prevScrollHeightRef.current = null
    }
  }, [messages])

  // ── Manejar scroll — disparar carga y rastrear posición ──────────────
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // El usuario está "en el fondo" si le quedan menos de 50px para el final
    isAtBottomRef.current = (scrollHeight - scrollTop - clientHeight) < 50

    // Si llegó al tope y hay más mensajes, cargar página anterior
    if (scrollTop === 0 && hasMore && !loadingOlder) {
      cargarMensajesAntiguos()
    }
  }, [hasMore, loadingOlder, cargarMensajesAntiguos])

  // ── Auto-scroll en mensajes nuevos (socket/envío) ──
  // Usamos una ref para rastrear el ID del último mensaje. 
  // - Si cargamos viejos (prepend), el último mensaje NO cambia → no auto-scrollea.
  // - Si entra uno nuevo (append), el último mensaje CAMBIA → auto-scrollea suavemente.
  const lastMessageIdRef = useRef(null)

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const currentLastId = messages[messages.length - 1]._id

      if (lastMessageIdRef.current !== currentLastId) {
        const isInitialLoad = lastMessageIdRef.current === null
        lastMessageIdRef.current = currentLastId

        // Solo hacemos auto-scroll suave para mensajes NUEVOS.
        // La carga inicial (isInitialLoad) se maneja en ChatMessageList con onAnimationStart
        if (!isInitialLoad) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTo({
                  top: chatContainerRef.current.scrollHeight,
                  behavior: 'smooth'
                })
              }
            })
          })
        }
      }
    } else if (messages.length === 0) {
      lastMessageIdRef.current = null
    }
  }, [messages, isLoading])

  // ── Enviar mensaje ─────────────────────────────────────────────────────────
  const handleSend = async (inputRef) => {
    const text = inputText.trim()
    if (!text || !chatEnabled || sending) return
    setSending(true)
    setInputText('')
    inputRef?.current?.focus()
    const result = await sendMessage(text)
    if (result?.ok && result?.message) {
      // Update optimista: agregar el mensaje propio desde el ack sin esperar el broadcast
      setMessages(prev =>
        prev.some(m => m._id?.toString() === result.message._id?.toString())
          ? prev
          : [...prev, result.message]
      )
    } else if (!result?.ok) {
      setInputText(text) // restaurar texto si falló el envío
    }
    setSending(false)
  }

  const currentUserId = user?._id ?? user?.id
  const isRequester = exchange?.requester?._id === currentUserId
  const contraparte = exchange
    ? (isRequester ? exchange.owner : exchange.requester)
    : null
  const isContraparteDeleted = !!exchange && !contraparte

  const canSend = inputText.trim().length > 0 && chatEnabled && !sending && !!token && !isContraparteDeleted

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: 'linear-gradient(180deg, #F9F7F4 0%, #F3F1EE 100%)' }}
    >
      <ChatHeader
        onBack={onBack}
        exchange={exchange}
        currentUserId={currentUserId}
      />

      <AnimatePresence>
        {!isLoading && !error && isChatActive && !connected && !isContraparteDeleted && (
          <ReconnectBanner connError={connError} />
        )}
      </AnimatePresence>

      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        error={
          error === 'No tenés permisos para ver este chat, o el intercambio no está activo.' && exchange?.status === 'pending'
            ? 'esperando_vendedor'
            : error
        }
        retrying={retrying}
        chatEnabled={chatEnabled && !isContraparteDeleted}
        currentUserId={currentUserId}
        bottomRef={bottomRef}
        onRetry={() => { setRetrying(true); fetchMessages() }}
        // H6.4: paginación
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        chatContainerRef={chatContainerRef}
        onScroll={handleScroll}
      />

      <AnimatePresence>
        {!error && (
          isContraparteDeleted ? (
            <div className="bg-slate-50 border-t border-slate-200/60 px-6 py-4 flex flex-col items-center gap-2 text-center text-slate-500 shadow-inner shrink-0 select-none">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chat Deshabilitado</p>
                <p className="text-[11px] text-slate-400">El otro usuario ha eliminado su cuenta y esta conversación no se puede continuar.</p>
              </div>
            </div>
          ) : isChatActive ? (
            <ChatInput
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSend}
              chatEnabled={chatEnabled}
              sending={sending}
              canSend={canSend}
            />
          ) : (
            exchangeStatus && <ChatClosedBanner exchangeStatus={exchangeStatus} />
          )
        )}
      </AnimatePresence>
    </div>
  )
}
