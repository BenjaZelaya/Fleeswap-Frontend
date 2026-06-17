// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

const CONFIG = {
  completed: {
    wrapper: 'bg-green-50 border-t border-green-100',
    icon: (
      <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Este intercambio ha sido completado. El chat se encuentra en modo solo lectura.',
    textColor: 'text-green-700',
  },
  cancelled: {
    wrapper: 'bg-slate-50 border-t border-slate-200',
    icon: (
      <svg className="h-4 w-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    text: 'Este intercambio fue cancelado. El chat ha sido cerrado.',
    textColor: 'text-slate-500',
  },
  suspended: {
    wrapper: 'bg-amber-50 border-t border-amber-200',
    icon: (
      <svg className="h-4 w-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    text: 'El chat ha sido deshabilitado temporalmente. El artículo involucrado está bajo revisión administrativa.',
    textColor: 'text-amber-700',
  },
}

export default function ChatClosedBanner({ exchangeStatus }) {
  const cfg = CONFIG[exchangeStatus] ?? CONFIG.cancelled

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 overflow-hidden"
    >
      <div className={`flex items-center justify-center gap-2 px-4 py-3 pb-20 lg:pb-3 ${cfg.wrapper}`}>
        {cfg.icon}
        <span className={`text-xs font-medium text-center ${cfg.textColor}`}>
          {cfg.text}
        </span>
      </div>
    </motion.div>
  )
}
