// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import ChatSkeleton from './ChatSkeleton'
import ChatError from './ChatError'
import ChatEmpty from './ChatEmpty'
import MessageBubble from './MessageBubble'

// Renderiza la lista de mensajes del chat.
export default function ChatMessageList({
  messages,
  isLoading,
  error,
  retrying,
  chatEnabled,
  currentUserId,
  bottomRef,
  onRetry,
  // H6.4
  hasMore,
  loadingOlder,
  chatContainerRef,
  onScroll,
}) {
  return (
    <div
      ref={chatContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
    >
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* Loading inicial */}
          {isLoading && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatSkeleton />
            </motion.div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh] flex items-center justify-center"
            >
              <ChatError message={error} onRetry={onRetry} retrying={retrying} />
            </motion.div>
          )}

          {/* Empty */}
          {!isLoading && !error && messages.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh] flex items-center justify-center"
            >
              <ChatEmpty chatEnabled={chatEnabled} />
            </motion.div>
          )}

          {/* Lista de mensajes */}
          {!isLoading && !error && messages.length > 0 && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onAnimationStart={() => {
                // Se ejecuta apenas arranca la animación (opacity: 0)
                // Salta al fondo instantáneamente mientras es invisible.
                // Así cuando termina de aparecer, ya está abajo del todo limpiamente.
                if (chatContainerRef.current) {
                  chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
                }
              }}
              className="flex flex-col gap-2 pb-2"
            >
              {/* H6.4: Spinner de carga de mensajes más antiguos */}
              {loadingOlder && (
                <div className="flex justify-center items-center py-3">
                  <svg
                    className="animate-spin h-5 w-5 text-brand"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              )}

              {/* H6.4: Banner de inicio de conversación */}
              {!hasMore && !loadingOlder && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-slate-200/70" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Inicio de la conversación
                  </span>
                  <div className="flex-1 h-px bg-slate-200/70" />
                </div>
              )}

              {messages.map((msg, i) => {
                const isOwn = String(msg.sender?._id) === String(currentUserId)
                const prevSender = messages[i - 1]?.sender?._id
                const showAvatar = !isOwn && String(msg.sender?._id) !== String(prevSender)
                const currDay = msg.createdAt?.slice(0, 10)
                const prevDay = messages[i - 1]?.createdAt?.slice(0, 10)
                const showDivider = i === 0 || currDay !== prevDay

                return (
                  <div key={msg._id ?? `msg-${i}`}>
                    {/* Separador de día */}
                    {showDivider && (
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                    )}
                    <MessageBubble message={msg} isOwn={isOwn} showAvatar={showAvatar} />
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
