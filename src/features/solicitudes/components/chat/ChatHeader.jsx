import { Link, useNavigate } from 'react-router-dom'

const TYPE_META = {
  purchase: { label: 'Compra', bg: 'bg-brand/10 text-brand border-brand/20' },
  exchange: { label: 'Intercambio', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
}

const STATUS_META = {
  active: { label: 'Activo', dot: 'bg-emerald-400', text: 'text-emerald-600' },
  completed: { label: 'Finalizado', dot: 'bg-slate-400', text: 'text-slate-500' },
  cancelled: { label: 'Cancelado', dot: 'bg-red-400', text: 'text-red-500' },
  rejected: { label: 'Rechazado', dot: 'bg-red-400', text: 'text-red-500' },
  pending: { label: 'Pendiente', dot: 'bg-amber-400', text: 'text-amber-600' },
}

function UserAvatar({ photo, nombre, isDeleted }) {
  if (isDeleted) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
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
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
      <span className="text-white font-bold text-sm leading-none">{initial}</span>
    </div>
  )
}

export default function ChatHeader({ onBack, exchange, currentUserId }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  const isLoaded = !!exchange
  const isPurchase = (exchange?.type ?? 'exchange') === 'purchase'
  const isRequester = exchange?.requester?._id === currentUserId

  const contraparte = exchange
    ? (isRequester ? exchange.owner : exchange.requester)
    : null

  const isDeleted = isLoaded && !contraparte
  const contraparteName = isDeleted
    ? 'Usuario eliminado'
    : [contraparte?.nombre, contraparte?.apellido].filter(Boolean).join(' ') || 'Usuario'

  // Producto relevante: lo que el usuario actual va a RECIBIR / comprar
  const productToShow = exchange
    ? (isRequester
      ? exchange.requestedPublication   // lo que quiero recibir
      : (isPurchase
        ? exchange.requestedPublication   // owner en compra: lo que vendo
        : exchange.offeredPublication))   // owner en intercambio: lo que me ofrecen
    : null

  const contraparteId = contraparte?._id ?? contraparte?.id
  const productImage = productToShow?.photos?.[0]
  const productTitle = productToShow?.title
  const typeMeta = TYPE_META[isPurchase ? 'purchase' : 'exchange']
  const exchangeStatus = exchange?.status
  const statusMeta = STATUS_META[exchangeStatus]

  return (
    <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">

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

      {/* Contenido del header */}
      {isLoaded ? (
        <>
          {isDeleted ? (
            /* Contraparte eliminada */
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar isDeleted={true} />
              <div className="min-w-0">
                <p className="font-bold text-slate-400 italic text-sm leading-snug">
                  Usuario eliminado
                </p>
              </div>
            </div>
          ) : (
            /* Contraparte activa */
            <Link
              to={`/profile/${contraparteId}`}
              className="flex items-center gap-2.5 min-w-0 group"
              title={`Ver perfil de ${contraparteName}`}
            >
              <UserAvatar photo={contraparte.photo} nombre={contraparte.nombre} />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate leading-snug group-hover:text-brand transition-colors">
                  {contraparteName}
                </p>
                {statusMeta && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta.dot}`} />
                    <span className={`text-[10px] font-medium leading-none ${statusMeta.text}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Separador */}
          <div className="hidden sm:block w-px h-8 bg-slate-100 shrink-0 mx-1" />

          {/* Producto involucrado */}
          {productToShow && (
            <div className="hidden sm:flex items-center gap-2.5 min-w-0 flex-1">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productTitle}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate leading-snug">{productTitle}</p>
                <span className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border mt-0.5 ${typeMeta.bg}`}>
                  {typeMeta.label}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Fallback skeleton cuando no hay datos del intercambio aún */
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded animate-pulse w-28" />
            <div className="h-2 bg-slate-100 rounded animate-pulse w-16" />
          </div>
        </div>
      )}
    </div>
  )
}
