/**
 * ChatView.jsx — H4.2 / H4.3
 *
 * Orquestador delgado: solo lógica de estado y composición.
 * Toda la UI vive en src/features/solicitudes/components/chat/
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import { getHistorialMensajes } from '../services/chatService'
import { getIntercambio }       from '../services/solicitudService'
import { useChatSocket }        from '../hooks/useChatSocket'

import ChatHeader       from '../components/chat/ChatHeader'
import ReconnectBanner  from '../components/chat/ReconnectBanner'
import ChatMessageList  from '../components/chat/ChatMessageList'
import ChatInput        from '../components/chat/ChatInput'
import ChatClosedBanner from '../components/chat/ChatClosedBanner'

export default function ChatView({ exchangeId: propId, onBack, exchange: propExchange } = {}) {
  const params = useParams()
  const id = propId ?? params.id
  const { user, token } = useAuthStore()

  const [messages,       setMessages]       = useState([])
  const [isLoading,      setIsLoading]      = useState(true)
  const [error,          setError]          = useState(null)
  const [retrying,       setRetrying]       = useState(false)
  const [inputText,      setInputText]      = useState('')
  const [sending,        setSending]        = useState(false)
  const [exchangeStatus, setExchangeStatus] = useState(null)
  const [exchange,       setExchange]       = useState(propExchange ?? null)

  const bottomRef = useRef(null)

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

  // ── Historial REST ─────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    setRetrying(false)
    try {
      const data = await getHistorialMensajes(id)
      setMessages(data.messages ?? [])
      setExchangeStatus(data.exchangeStatus ?? null)
    } catch (err) {
      const status = err.response?.status
      if (status === 403)      setError('No tenés permisos para ver este chat, o el intercambio no está activo.')
      else if (status === 404) setError('Este intercambio no existe.')
      else                     setError('No se pudo cargar el chat. Verificá tu conexión e intentá de nuevo.')
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
      getIntercambio(id).then(setExchange).catch(() => {})
    }
  }, [id, propExchange])


  // ── Auto-scroll al recibir mensajes nuevos (fallback suave) ─────────────
  useEffect(() => {
    if (!isLoading && messages.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

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
