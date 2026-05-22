import { useRef } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

const MAX_CHARS = 1000

export default function ChatInput({ inputText, setInputText, onSend, chatEnabled, sending, canSend }) {
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(inputRef)
    }
  }

  return (
    <div className="shrink-0 pb-20 lg:pb-0 bg-white border-t border-slate-100 shadow-[0_-2px_16px_rgba(0,0,0,0.05)]">

      {/* Separador decorativo */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      <div className="px-4 py-3 max-w-2xl mx-auto">

        {/* Estado: sin conexión */}
        {!chatEnabled && !sending && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-medium text-amber-600 uppercase tracking-widest">
              Conectando al chat...
            </span>
          </div>
        )}

        {/* Contenedor del input */}
        <div className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-200 bg-white border-slate-200 focus-within:border-brand/40 focus-within:shadow-[0_0_0_4px_rgba(27,54,93,0.06)]">

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setInputText(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder="Escribí un mensaje..."
            rows={1}
            aria-label="Campo de mensaje"
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed disabled:cursor-not-allowed max-h-28 overflow-y-auto custom-scrollbar py-0.5 font-[inherit]"
          />

          {/* Contador + botón enviar (alineados horizontalmente al centro) */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Contador de caracteres */}
            <AnimatePresence>
              {inputText.length > 800 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-[10px] font-semibold tabular-nums ${inputText.length > 950 ? 'text-red-400' : 'text-slate-400'
                    }`}
                >
                  {MAX_CHARS - inputText.length}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Botón enviar */}
            <motion.button
              onClick={() => onSend(inputRef)}
              disabled={!canSend}
              aria-label="Enviar mensaje"
              whileTap={canSend ? { scale: 0.88 } : {}}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${canSend
                ? 'bg-brand text-white hover:bg-brand-light shadow-md hover:shadow-[0_4px_14px_rgba(27,54,93,0.30)]'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
            >
              {sending ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        {/* Hint Enter — solo visible en desktop cuando hay texto */}
        <AnimatePresence>
          {chatEnabled && inputText.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="hidden sm:block text-[10px] text-slate-300 mt-2 ml-1 font-light"
            >
              Enter para enviar · Shift+Enter para nueva línea
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
