export default function StatusBadge({ status }) {
  const map = {
    available: {
      text: 'Activa',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    unavailable: {
      text: 'Pausada',
      classes: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    suspended: {
      text: 'Suspendida',
      classes: 'bg-rose-50 text-rose-700 border-rose-100'
    },
    exchanged: {
      text: 'Intercambiada',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-100'
    },
    active: {
      text: 'Activo',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    inactive: {
      text: 'Inactivo',
      classes: 'bg-rose-50 text-rose-700 border-rose-100'
    }
  }
  const config = map[status] || { text: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${config.classes}`}>
      {config.text}
    </span>
  )
}
