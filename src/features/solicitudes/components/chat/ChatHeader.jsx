import { useNavigate } from 'react-router-dom'

const STATUS_META = {
  loading: {
    dot: 'bg-slate-300',
    label: 'Cargando',
    pill: 'bg-amber-50 border-amber-100 text-amber-600',
  },
  error: {
    dot: 'bg-red-400',
    label: 'Error',
    pill: 'bg-red-50 border-red-100 text-red-500',
  },
  online: {
    dot: 'bg-emerald-400 animate-pulse',
    label: 'En línea',
    pill: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  },
  connecting: {
    dot: 'bg-amber-400 animate-pulse',
    label: 'Conectando',
    pill: 'bg-amber-50 border-amber-100 text-amber-600',
  },
}

function UserAvatar({ photo, nombre }) {
  const initial = nombre?.[0]?.toUpperCase() ?? '?'
  if (photo) {
    return (
      <img
        src={photo}
        alt={nombre}
        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-sm leading-none">{initial}</span>
    </div>
  )
}

function ProductThumb({ image, title, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm"
        />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200" />
      )}
      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide leading-none">
        {label}
      </span>
    </div>
  )
}

export default function ChatHeader({ connStatus, onBack, exchange, currentUserId }) {
  const navigate = useNavigate()
  const meta = STATUS_META[connStatus] ?? STATUS_META.connecting
  const handleBack = onBack ?? (() => navigate(-1))

  const isRequester = exchange?.requester?._id === currentUserId
  const contraparte = exchange ? (isRequester ? exchange.owner               : exchange.requester)           : null
  const myPub       = exchange ? (isRequester ? exchange.offeredPublication   : exchange.requestedPublication) : null
  const theirPub    = exchange ? (isRequester ? exchange.requestedPublication : exchange.offeredPublication)   : null

  return (
    <div className="shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">

      {/* Botón volver */}
      <button
        onClick={handleBack}
        aria-label="Volver"
        className="p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/5 transition-all shrink-0 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Bloque izquierdo: identidad de la contraparte */}
      {contraparte ? (
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <UserAvatar photo={contraparte.photo} nombre={contraparte.nombre} />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate leading-snug">
              {contraparte.nombre} {contraparte.apellido}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
              <span className="text-[10px] text-slate-400 leading-none">{meta.label}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback cuando no hay datos del intercambio aún */
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-9 h-9 rounded-2xl bg-brand flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 2px 10px rgba(27,54,93,0.25)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">Coordinar intercambio</p>
            <p className="text-[10px] text-slate-400 truncate">Chat privado y seguro</p>
          </div>
        </div>
      )}

      {/* Bloque derecho: miniaturas del trueque (Das ↔ Recibes) — solo desktop */}
      {(myPub || theirPub) && (
        <div className="hidden sm:flex items-end gap-2 shrink-0">
          <ProductThumb
            image={myPub?.photos?.[0]}
            title={myPub?.title}
            label="Das"
          />
          <div className="flex items-center pb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <ProductThumb
            image={theirPub?.photos?.[0]}
            title={theirPub?.title}
            label="Recibes"
          />
        </div>
      )}

      {/* Pill de estado de conexión */}
      <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all ${meta.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        <span className="hidden md:block">{meta.label}</span>
      </div>

    </div>
  )
}
