import { useNavigate } from 'react-router-dom'

const STATUS_META = {
  active:    { label: 'En proceso',  pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  completed: { label: 'Finalizado',  pill: 'bg-slate-100  text-slate-500   border-slate-200'  },
  cancelled: { label: 'Cancelado',   pill: 'bg-red-50     text-red-500     border-red-100'    },
}

function Avatar({ photo, nombre }) {
  const initial = nombre?.[0]?.toUpperCase() ?? '?'
  if (photo) {
    return (
      <img
        src={photo}
        alt={nombre}
        className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
      />
    )
  }
  return (
    <div className="w-11 h-11 rounded-full bg-brand-accent flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-base">{initial}</span>
    </div>
  )
}

export default function ChatListItem({ exchange, currentUserId, isSelected }) {
  const navigate = useNavigate()

  const isRequester = exchange.requester?._id === currentUserId
  const contraparte = isRequester ? exchange.owner      : exchange.requester
  const myPub       = isRequester ? exchange.offeredPublication : exchange.requestedPublication
  const imagen      = myPub?.photos?.[0]
  const titulo      = myPub?.title ?? 'Publicación'

  const meta = STATUS_META[exchange.status] ?? STATUS_META.active

  return (
    <button
      onClick={() => navigate(`/chats/${exchange._id}`)}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 border-l-2 hover:bg-slate-50 ${
        isSelected
          ? 'bg-brand/5 border-brand'
          : 'border-transparent'
      }`}
    >
      {/* Avatar contraparte */}
      <Avatar photo={contraparte?.photo} nombre={contraparte?.nombre} />

      {/* Info central */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-800 truncate">
            {contraparte?.nombre} {contraparte?.apellido}
          </span>
          <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${meta.pill}`}>
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate">{titulo}</p>
      </div>

      {/* Miniatura producto */}
      {imagen && (
        <img
          src={imagen}
          alt={titulo}
          className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
        />
      )}
    </button>
  )
}
