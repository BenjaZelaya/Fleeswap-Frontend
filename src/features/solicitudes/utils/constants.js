export const ESTADOS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'active', label: 'Activas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export const BADGE = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  rejected: 'bg-red-50 text-red-500 border border-red-200',
  completed: 'bg-purple-100 text-purple-800 border border-purple-200',
  cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
}

export const BADGE_LABEL = {
  pending: 'Pendiente',
  active: 'Activa',
  rejected: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const CARD_ACCENT = {
  pending: 'border-l-4 border-l-amber-400',
  active: 'border-l-4 border-l-blue-400',
  rejected: 'border-l-4 border-l-red-300',
  completed: 'border-l-4 border-l-purple-400',
  cancelled: 'border-l-4 border-l-slate-300',
}

export const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}
