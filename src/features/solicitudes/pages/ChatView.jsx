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

  // Si no llega el exchange por prop (ruta standalone), cargarlo por API
  useEffect(() => {
    if (!propExchange && id) {
      getIntercambio(id).then(setExchange).catch(() => {})
    }
  }, [id, propExchange])

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

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

  // ── Estado de conexión para el header ──────────────────────────────────────
  // Muestra 'online' en cuanto el socket conecta (no espera room join)
  // para que el usuario vea el indicador verde de inmediato.
  const connStatus = isLoading ? 'loading'
    : error        ? 'error'
    : connected    ? 'online'
    : 'connecting'

  const currentUserId = user?._id ?? user?.id
  const canSend = inputText.trim().length > 0 && chatEnabled && !sending && !!token

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: 'linear-gradient(180deg, #F9F7F4 0%, #F3F1EE 100%)' }}
    >
      <ChatHeader
        connStatus={connStatus}
        onBack={onBack}
        exchange={exchange}
        currentUserId={currentUserId}
      />

      <AnimatePresence>
        {!isLoading && !error && isChatActive && !connected && (
          <ReconnectBanner connError={connError} />
        )}
      </AnimatePresence>

      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        retrying={retrying}
        chatEnabled={chatEnabled}
        currentUserId={currentUserId}
        bottomRef={bottomRef}
        onRetry={() => { setRetrying(true); fetchMessages() }}
      />

      <AnimatePresence>
        {!error && (
          isChatActive
            ? (
              <ChatInput
                inputText={inputText}
                setInputText={setInputText}
                onSend={handleSend}
                chatEnabled={chatEnabled}
                sending={sending}
                canSend={canSend}
              />
            )
            : exchangeStatus && <ChatClosedBanner exchangeStatus={exchangeStatus} />
        )}
      </AnimatePresence>
    </div>
  )
}
