// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { formatChatDate } from '../../utils/formatChatDate'

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const initial = message.sender?.nombre?.[0]?.toUpperCase() ?? '?'
  const senderName = [message.sender?.nombre, message.sender?.apellido].filter(Boolean).join(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isOwn && (
        <div className="w-8 h-8 shrink-0 mb-1">
          {showAvatar ? (
            message.sender?.photo ? (
              <img
                src={message.sender.photo}
                alt={senderName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {initial}
              </div>
            )
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Contenido */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nombre (solo primer mensaje del bloque) */}
        {!isOwn && showAvatar && senderName && (
          <span className="text-[10px] font-semibold text-slate-500 px-1 tracking-wide">
            {senderName}
          </span>
        )}

        {/* Burbuja */}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed wrap-break-word shadow-sm ${isOwn
              ? 'bg-brand text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm'
              : 'bg-white border border-slate-100 text-slate-800 rounded-tr-2xl rounded-tl-sm rounded-bl-2xl rounded-br-2xl'
            }`}
          style={isOwn
            ? { boxShadow: '0 2px 12px rgba(27,54,93,0.18)' }
            : { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
          }
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 font-light px-1 leading-none">
          {formatChatDate(message.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}
