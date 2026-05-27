import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function ProfileBanner({ user, onDismiss }) {
  const incomplete = !user?.photo && !user?.bio && !user?.location
  if (!incomplete) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="bg-brand/8 border-b border-brand/10"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="flex-1 text-xs text-brand-accent leading-snug">
          <span className="font-semibold">Tu perfil está incompleto.</span>{' '}
          Añadí una foto, bio y ubicación para que otros sepan quién sos.
        </p>
        <Link
          to="/complete-profile"
          className="text-[11px] font-semibold text-brand-accent hover:text-brand transition-colors whitespace-nowrap"
        >
          Completar →
        </Link>
        <button
          onClick={onDismiss}
          aria-label="Cerrar"
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
