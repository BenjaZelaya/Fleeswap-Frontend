// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function ReconnectBanner({ connError }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 overflow-hidden"
    >
      <div className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-100 px-4 py-2">
        <svg className="animate-spin h-3.5 w-3.5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-[11px] font-semibold text-amber-700">
          {connError ?? 'Reconectando al chat...'}
        </span>
      </div>
    </motion.div>
  )
}
