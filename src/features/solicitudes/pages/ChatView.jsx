import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import { getHistorialMensajes } from '../services/chatService'
import { formatChatDate } from '../utils/formatChatDate'

// ─── Skeleton de burbujas ─────────────────────────────────────────────────────
function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className="h-10 rounded-2xl bg-slate-200"
            style={{ width: `${40 + (i * 13) % 35}%` }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Estado de error ──────────────────────────────────────────────────────────
function ChatError({ message }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-800 font-bold text-lg">Acceso denegado</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
          {message || 'No tenés permisos para ver este chat o el intercambio fue cancelado.'}
        </p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-light transition-colors text-sm"
      >
        ← Volver
      </button>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function ChatEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </div>
      <div>
        <p className="text-slate-800 font-bold text-base">¡Es hora de coordinar!</p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">
          Cuando el backend habilite el envío de mensajes (H4.2), tu conversación aparecerá aquí.
        </p>
      </div>
    </div>
  )
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────
function MessageBubble({ message, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-1 max-w-[75%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
    >
      <div
        className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isOwn
            ? 'bg-brand text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none'
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
          }`}
      >
        {message.content || message.text || message.mensaje}
      </div>
      <span className="text-[10px] text-slate-400 font-light px-1">
        {formatChatDate(message.createdAt)}
      </span>
    </motion.div>
  )
}

// ─── ChatView principal ───────────────────────────────────────────────────────
export default function ChatView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const bottomRef = useRef(null)

  // Fetch historial de mensajes
  useEffect(() => {
    let active = true
    async function fetchMessages() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getHistorialMensajes(id)
        if (!active) return
        // Acepta tanto array directo como { messages: [...] }
        setMessages(Array.isArray(data) ? data : (data.messages ?? data.data ?? []))
      } catch (err) {
        if (!active) return
        const status = err.response?.status
        if (status === 403) {
          setError('No tenés permisos para ver este chat o el intercambio no está activo.')
        } else if (status === 404) {
          setError('Este intercambio no existe.')
        } else {
          setError('No se pudo cargar el chat. Intentá de nuevo más tarde.')
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    fetchMessages()
    return () => { active = false }
  }, [id])

  // Auto-scroll al último mensaje cuando carga
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLoading, messages.length])

  const currentUserId = user?._id ?? user?.id

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto w-full">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 bg-white shrink-0">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">Coordinar intercambio</p>
            <p className="text-[10px] text-slate-400 font-light truncate">ID: {id}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">En curso</span>
        </div>
      </div>

      {/* ── Área de mensajes ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/60 px-4 py-4">
        {isLoading ? (
          <ChatSkeleton />
        ) : error ? (
          <ChatError message={error} />
        ) : messages.length === 0 ? (
          <ChatEmpty />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => {
              const senderId = msg.sender?._id ?? msg.sender ?? msg.emisorId ?? msg.userId
              const isOwn = String(senderId) === String(currentUserId)
              return (
                <MessageBubble
                  key={msg._id ?? msg.id ?? i}
                  message={msg}
                  isOwn={isOwn}
                />
              )
            })}
            {/* Ancla para auto-scroll */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input Area (maquetado) ────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
          <input
            type="text"
            disabled
            placeholder="El envío de mensajes estará disponible próximamente..."
            className="flex-1 bg-transparent text-sm text-slate-400 placeholder:text-slate-300 outline-none cursor-not-allowed"
          />
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium uppercase tracking-wider shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            H4.2
          </div>
        </div>
      </div>
    </div>
  )
}
