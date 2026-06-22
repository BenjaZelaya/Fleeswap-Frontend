import { Link, useNavigate } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'

const STATUS_META = {
  active: { label: 'Activo', dot: 'bg-emerald-400', text: 'text-emerald-600' },
  completed: { label: 'Finalizado', dot: 'bg-slate-400', text: 'text-slate-500' },
  cancelled: { label: 'Cancelado', dot: 'bg-slate-400', text: 'text-slate-500' },
  rejected: { label: 'Rechazado', dot: 'bg-red-400', text: 'text-red-500' },
  pending: { label: 'Pendiente', dot: 'bg-amber-400', text: 'text-amber-600' },
}

function UserAvatar({ photo, nombre, isDeleted }) {
  if (isDeleted) {
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0 group-hover:border-brand/30 transition-colors"
      />
    )
  }
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm group-hover:border-brand/30 transition-colors">
      <span className="text-slate-500 font-bold text-xs sm:text-sm leading-none group-hover:text-brand transition-colors">{initial}</span>
    </div>
  )
}

function ChatProductMini({ pub, label }) {
  if (!pub) return null
  const photo = pub.photos?.[0] || pub.photo
  const title = pub.title || pub.titulo
  return (
    <Link 
      to={`/publications/${pub._id || pub.id}`}
      title={title}
      className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group shrink-0"
    >
      {photo ? (
        <img src={photo} alt={title} className="w-7 h-7 sm:w-8 sm:h-8 rounded-md object-cover border border-slate-200 group-hover:border-brand/30 transition-colors" />
      ) : (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 border border-slate-200 group-hover:border-brand/30 transition-colors" />
      )}
      <div className="hidden md:block min-w-0 max-w-[90px] lg:max-w-[140px]">
        {label && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>}
        <p className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-brand transition-colors leading-tight">{title}</p>
      </div>
    </Link>
  )
}

export default function ChatHeader({ onBack, exchange, currentUserId }) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  const isLoaded = !!exchange
  const isPurchase = (exchange?.type ?? 'exchange') === 'purchase'
  
  // requester puede venir como string (no poblado) o como objeto poblado
  const requesterIdStr = typeof exchange?.requester === 'object' 
    ? (exchange?.requester?._id || exchange?.requester?.id)
    : exchange?.requester;
  
  const amIRequester = String(requesterIdStr) === String(currentUserId)

  const otherUser = isLoaded ? (amIRequester ? exchange.owner : exchange.requester) : null
  const isDeleted = isLoaded && !otherUser
  const userName = isDeleted
    ? 'Usuario eliminado'
    : [otherUser?.nombre, otherUser?.apellido].filter(Boolean).join(' ') || 'Usuario'

  let productoEnviar = null
  let productoRecibir = null
  let productoComprado = null
  let precio = 0
  let complementaryAmount = exchange?.complementaryAmount || 0

  if (isLoaded) {
    if (isPurchase) {
      productoComprado = exchange.requestedPublication
      precio = Number(productoComprado?.price || productoComprado?.precio || complementaryAmount || 0)
    } else {
      if (amIRequester) {
        productoEnviar = exchange.offeredPublication
        productoRecibir = exchange.requestedPublication
      } else {
        productoEnviar = exchange.requestedPublication
        productoRecibir = exchange.offeredPublication
      }
    }
  }

  const exchangeStatus = exchange?.status
  const statusMeta = STATUS_META[exchangeStatus]

  return (
    <div className="shrink-0 bg-white border-b border-slate-100 px-2 sm:px-4 py-2 sm:py-3 shadow-sm z-10 relative">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full h-[48px] sm:h-[56px]">
        
        {/* Lado Izquierdo: Botón Volver + Usuario */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0">
          <button
            onClick={handleBack}
            aria-label="Volver"
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/5 transition-all shrink-0 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {isLoaded ? (
            isDeleted ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar isDeleted={true} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-400 italic text-sm leading-snug">Usuario eliminado</p>
                </div>
              </div>
            ) : (
              <Link
                to={`/profile/${otherUser?._id || otherUser?.id}`}
                className="flex items-center gap-2 sm:gap-3 min-w-0 group px-1 sm:px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors"
                title={`Ver perfil de ${userName}`}
              >
                <UserAvatar photo={otherUser.photo} nombre={otherUser.nombre} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm sm:text-base truncate leading-none mb-1 group-hover:text-brand transition-colors">
                    {userName}
                  </p>
                  {statusMeta && (
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta.dot}`} />
                      <span className={`text-[10px] sm:text-xs font-semibold tracking-wide leading-none ${statusMeta.text}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-200 rounded animate-pulse w-24" />
                <div className="h-2 bg-slate-100 rounded animate-pulse w-16" />
              </div>
            </div>
          )}
        </div>

        {/* Lado Derecho: Detalles del Intercambio (Compacto) */}
        {isLoaded && !isDeleted && (
          <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-50/80 rounded-xl p-1 sm:px-3 sm:py-1.5 border border-slate-100 shrink-0">
            {isPurchase ? (
              <>
                <ChatProductMini pub={productoComprado} label="Producto" />
                <div className="w-px h-6 bg-slate-200 shrink-0 hidden sm:block mx-1" />
                <div className="px-1.5 sm:px-2 text-right">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 hidden sm:block">Precio</p>
                  <p className="text-sm sm:text-base font-black text-emerald-600 leading-none">${precio.toLocaleString('es-AR')}</p>
                </div>
              </>
            ) : (
              <>
                <ChatProductMini pub={productoEnviar} label="Dás" />
                <ArrowRightLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 shrink-0 mx-0.5" />
                <ChatProductMini pub={productoRecibir} label="Recibís" />
                {complementaryAmount > 0 && (
                  <>
                    <div className="w-px h-6 bg-slate-200 shrink-0 hidden sm:block mx-1" />
                    <div className="px-1.5 sm:px-2 text-right">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 hidden sm:block">$ Adicional</p>
                      <p className="text-sm sm:text-base font-black text-emerald-600 leading-none">${complementaryAmount.toLocaleString('es-AR')}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
