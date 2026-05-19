/**
 * ChatView.jsx — Acceder al Chat del Intercambio
 *
 * Consume: GET /api/exchanges/:id/messages
 * Respuesta: { messages, hasMore, exchangeStatus }
 *
 * sender._id es el campo canónico del backend para comparar con el usuario actual.
 *
 * Estados UI:
 *   - loading  → skeleton de burbujas
 *   - error    → pantalla de acceso denegado con retry
 *   - empty    → ilustración vacía con mensaje amigable
 *   - success  → lista de burbujas + auto-scroll al último
 *
 * Nota: el input está maquetado pero deshabilitado hasta H4.2 (Sockets).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import { getHistorialMensajes } from '../services/chatService'
import { formatChatDate } from '../utils/formatChatDate'

// ─── Constantes ────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function ChatSkeleton() {
  const widths = ['55%', '40%', '65%', '35%', '50%', '45%']
  return (
    <div className="flex flex-col gap-3 px-4 py-6 animate-pulse">
      {widths.map((w, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          {i % 2 === 0 && (
            <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mr-2 mt-auto" />
          )}
          <div className="h-10 rounded-2xl bg-slate-200" style={{ width: w }} />
        </div>
      ))}
    </div>
  )
}

// ─── Error ─────────────────────────────────────────────────────────────────────
function ChatError({ message, onRetry, retrying }) {
  const navigate = useNavigate()
  const isPermission = message?.toLowerCase().includes('permiso') || message?.toLowerCase().includes('acceso')
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPermission ? 'bg-red-50' : 'bg-amber-50'}`}>
        {isPermission ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-slate-800 font-bold text-lg">
          {isPermission ? 'Acceso denegado' : 'No se pudo cargar el chat'}
        </p>
        <p className="text-slate-400 text-sm mt-1 max-w-xs leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {!isPermission && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center justify-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-light transition-colors text-sm disabled:opacity-50"
          >
            {retrying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Reintentando...
              </>
            ) : 'Reintentar'}
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          ← Volver
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function ChatEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-brand/8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
      </div>
      <div>
        <p className="text-slate-800 font-bold text-base">¡Es hora de coordinar!</p>
        <p className="text-slate-400 text-sm mt-1.5 max-w-[260px] leading-relaxed">
          El chat está listo. Cuando ambos comiencen a chatear, los mensajes aparecerán aquí.
        </p>
      </div>
      <div className="text-[11px] text-slate-300 font-medium uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Mensajes en tiempo real disponibles en H4.2
      </div>
    </div>
  )
}

// ─── Burbuja ───────────────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn, showAvatar }) {
  const initial = message.sender?.nombre?.[0]?.toUpperCase() ?? '?'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar del otro participante */}
      {!isOwn && (
        <div className="w-7 h-7 shrink-0 mb-1">
          {showAvatar ? (
            message.sender?.photo ? (
              <img
                src={message.sender.photo}
                alt={message.sender.nombre}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-[11px] font-bold text-brand">
                {initial}
              </div>
            )
          ) : (
            <div className="w-7 h-7" /> // spacer para mensajes consecutivos del mismo usuario
          )}
        </div>
      )}

      {/* Burbuja + timestamp */}
      <div className={`flex flex-col gap-1 max-w-[72%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm wrap-break-word ${isOwn
            ? 'bg-brand text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none'
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
            }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-400 font-light px-1">
          {formatChatDate(message.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}

// ─── ChatView ──────────────────────────────────────────────────────────────────
export default function ChatView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const bottomRef = useRef(null)

  // ── Fetch con lógica de retry automático ──────────────────────────────────
  const fetchMessages = useCallback(async (attempt = 0) => {
    try {
      setError(null)
      const data = await getHistorialMensajes(id)
      // El backend devuelve { messages, hasMore, exchangeStatus }
      setMessages(data.messages ?? [])
      setRetryCount(0)
    } catch (err) {
      const status = err.response?.status

      // Errores de permisos/estado: no tiene sentido reintentar
      if (status === 403 || status === 404) {
        setError(
          status === 404
            ? 'Este intercambio no existe.'
            : 'No tenés permisos para ver este chat, o el intercambio está en un estado que no permite el chat.'
        )
        return
      }

      // Error de red o servidor: reintentar con back-off
      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt + 1)
        setTimeout(() => {
          fetchMessages(attempt + 1)
        }, RETRY_DELAY_MS * (attempt + 1))
      } else {
        setError('No se pudo cargar el chat. Verificá tu conexión y volvé a intentarlo.')
      }
    } finally {
      setIsLoading(false)
      setRetrying(false)
    }
  }, [id])

  useEffect(() => {
    setIsLoading(true)
    fetchMessages(0)
  }, [fetchMessages])

  // ── Auto-scroll al último mensaje ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLoading, messages.length])

  // ── ID del usuario actual ─────────────────────────────────────────────────
  const currentUserId = user?._id ?? user?.id

  // ── Handler de retry manual ───────────────────────────────────────────────
  const handleRetry = () => {
    setIsLoading(true)
    setRetrying(true)
    fetchMessages(0)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full bg-slate-50/40">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shrink-0 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 text-sm truncate">Coordinar intercambio</p>
          <p className="text-[10px] text-slate-400 truncate">
            {retryCount > 0
              ? `Reintentando (${retryCount}/${MAX_RETRIES})...`
              : 'Chat privado del intercambio'
            }
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
            {isLoading ? 'Cargando' : error ? 'Error' : 'En curso'}
          </span>
        </div>
      </div>

      {/* ── Área de mensajes ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ChatError message={error} onRetry={handleRetry} retrying={retrying} />
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ChatEmpty />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2"
            >
              {messages.map((msg, i) => {
                const isOwn = String(msg.sender?._id) === String(currentUserId)
                // Mostrar avatar solo si es el primer mensaje del bloque de ese usuario
                const prevSender = messages[i - 1]?.sender?._id
                const showAvatar = String(msg.sender?._id) !== String(prevSender)
                return (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                  />
                )
              })}
              {/* Ancla para auto-scroll */}
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input Area — maquetado para H4.2 ────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
          <input
            type="text"
            disabled
            placeholder="El envío de mensajes estará disponible próximamente..."
            aria-label="Campo de mensaje (deshabilitado)"
            className="flex-1 bg-transparent text-sm text-slate-400 placeholder:text-slate-300 outline-none cursor-not-allowed"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden sm:block">H4.2</span>
          </div>
        </div>
      </div>
    </div>
  )
}
