import { useNavigate } from 'react-router-dom'

const STATUS_META = {
  loading: {
    dot: 'bg-slate-300',
    label: 'Cargando',
    pill: 'bg-amber-50 border-amber-100 text-amber-600'
  },
  error: {
    dot: 'bg-red-400',
    label: 'Error',
    pill: 'bg-red-50 border-red-100 text-red-500'
  },
  online: {
    dot: 'bg-emerald-400 animate-pulse',
    label: 'En línea',
    pill: 'bg-emerald-50 border-emerald-100 text-emerald-700'
  },
  connecting: {
    dot: 'bg-amber-400 animate-pulse',
    label: 'Conectando',
    pill: 'bg-amber-50 border-amber-100 text-amber-600'
  },
}

export default function ChatHeader({ connStatus }) {
  const navigate = useNavigate()
  const meta = STATUS_META[connStatus] ?? STATUS_META.connecting

  return (
    <div className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">

      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Volver"
        className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/5 transition-all shrink-0 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Icono de sala */}
      <div
        className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shrink-0"
        style={{ boxShadow: '0 2px 10px rgba(27,54,93,0.25)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>

      {/* Título */}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 text-sm truncate tracking-tight">Coordinar intercambio</p>
        <p className="text-[10px] text-slate-400 truncate font-light">Chat privado y seguro</p>
      </div>

      {/* Pill de estado */}
      <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all ${meta.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        <span className="hidden sm:block">{meta.label}</span>
      </div>
    </div>
  )
}
