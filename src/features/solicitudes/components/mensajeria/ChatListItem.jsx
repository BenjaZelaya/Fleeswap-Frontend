import { useNavigate } from 'react-router-dom'

const STATUS_META = {
  active:    { label: 'Activo',      pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  completed: { label: 'Finalizado',  pill: 'bg-slate-100  text-slate-500   border-slate-200'  },
  cancelled: { label: 'Cancelado',   pill: 'bg-red-50     text-red-500     border-red-100'    },
  rejected:  { label: 'Rechazado',   pill: 'bg-red-50     text-red-500     border-red-100'    },
}

function Avatar({ photo, nombre, isDeleted }) {
  if (isDeleted) {
    return (
      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
    )
  }
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

  const isPurchase = (exchange.type ?? 'exchange') === 'purchase'
  const isRequester = exchange.requester?._id === currentUserId

  // La contraparte siempre es el otro usuario
  const contraparte = isRequester ? exchange.owner : exchange.requester
  const isDeleted = !contraparte || !contraparte.nombre
  const contraparteName = isDeleted ? 'Usuario eliminado' : `${contraparte.nombre} ${contraparte.apellido || ''}`.trim()

  // La imagen que se muestra es el producto que me interesa / me ofrecen
  // Requester: lo que quiero (requestedPublication)
  // Owner: lo que me ofrecen (offeredPublication) — o requestedPublication en compra
  const productToShow = isRequester
    ? exchange.requestedPublication
    : (isPurchase ? exchange.requestedPublication : exchange.offeredPublication)

  const imagen = productToShow?.photos?.[0]
  const titulo = productToShow?.title ?? 'Publicación'

  const meta = STATUS_META[exchange.status] ?? STATUS_META.active

  // Determinar dinámicamente badge de rol
  let badgeText = 'Intercambio'
  let badgeClass = 'bg-blue-50 text-blue-600 border-blue-100'

  if (isPurchase) {
    if (isRequester) {
      badgeText = 'Compra'
      badgeClass = 'bg-brand/10 text-brand border-brand/20'
    } else {
      badgeText = 'Venta'
      badgeClass = 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  }

  // Fecha: updatedAt o createdAt
  const fecha = (() => {
    const d = exchange.updatedAt ?? exchange.createdAt
    if (!d) return ''
    const date = new Date(d)
    const now = new Date()
    const diffDays = Math.floor((now - date) / 86400000)
    if (diffDays === 0) return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return date.toLocaleDateString('es-AR', { weekday: 'short' })
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  })()

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
      <Avatar photo={contraparte?.photo} nombre={contraparte?.nombre} isDeleted={isDeleted} />

      {/* Info central */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-sm font-semibold truncate ${isDeleted ? 'text-slate-400 italic' : 'text-slate-800'}`}>
            {contraparteName}
          </span>
          <span className="shrink-0 text-[10px] text-slate-400">{fecha}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Miniatura producto — lo que le interesa al usuario */}
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
