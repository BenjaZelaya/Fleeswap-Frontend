import { motion, AnimatePresence } from 'framer-motion'

export default function FormField({ label, error, children }) {
  return (
    <div className="space-y-0">
      <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-2">
        {label}
      </label>
      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] font-medium text-red-500 pt-1.5 flex items-center gap-1.5 overflow-hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export const inputClass = (error) =>
  `w-full px-4 py-3.5 rounded-t-lg border-0 border-b-2 text-sm font-medium text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 ` +
  (error
    ? 'bg-red-50/40 border-red-400'
    : 'bg-slate-100/60 border-slate-200 focus:bg-white focus:border-slate-900')
