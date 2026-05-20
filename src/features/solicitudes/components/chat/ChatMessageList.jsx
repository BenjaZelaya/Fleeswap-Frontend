// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import ChatSkeleton    from './ChatSkeleton'
import ChatError       from './ChatError'
import ChatEmpty       from './ChatEmpty'
import MessageBubble   from './MessageBubble'

export default function ChatMessageList({
  messages,
  isLoading,
  error,
  retrying,
  chatEnabled,
  currentUserId,
  bottomRef,
  onRetry,
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* Loading */}
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
              className="flex flex-col gap-2 pb-2"
            >
              {messages.map((msg, i) => {
                const isOwn       = String(msg.sender?._id) === String(currentUserId)
                const prevSender  = messages[i - 1]?.sender?._id
                const showAvatar  = !isOwn && String(msg.sender?._id) !== String(prevSender)
                const currDay     = msg.createdAt?.slice(0, 10)
                const prevDay     = messages[i - 1]?.createdAt?.slice(0, 10)
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
