import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, MessageSquare, Star } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  active: { label: 'En Curso', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-800 border-red-200' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function ProductMini({ pub, fallbackText }) {
  if (!pub) return <span className="text-xs text-slate-400 italic">{fallbackText}</span>
  const photo = pub.photos?.[0] || pub.photo
  const title = pub.title || pub.titulo
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 pr-4 border border-slate-100 w-full">
      {photo ? (
        <img src={photo} alt={title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
      )}
      <span className="text-sm font-semibold text-slate-700 line-clamp-1">{title}</span>
    </div>
  )
}

export default function UnifiedExchangeCard({ exchange, onCalificar }) {
  const navigate = useNavigate()
  
  // Extraemos la data base
  const { _id, id, source, type, status, complementaryAmount = 0, hasRated } = exchange
  const exchangeId = _id || id
  const isPurchase = type === 'purchase'
  const isCompleted = status === 'completed'
  const amIRequester = source === 'sent'

  // Determinamos el usuario contraparte
  const otherUser = amIRequester ? exchange.owner : exchange.requester
  const userName = otherUser?.nombre 
    ? `${otherUser.nombre} ${otherUser.apellido || ''}`.trim() 
    : 'Usuario'

  // Determinamos los productos
  let productoEnviar = null
  let productoRecibir = null
  let productoComprado = null
  let precio = 0

  if (isPurchase) {
    productoComprado = exchange.requestedPublication
    precio = Number(productoComprado?.price || productoComprado?.precio || exchange.complementaryAmount || 0)
  } else {
    if (amIRequester) {
      productoEnviar = exchange.offeredPublication
      productoRecibir = exchange.requestedPublication
    } else {
      productoEnviar = exchange.requestedPublication
      productoRecibir = exchange.offeredPublication
    }
  }

  // Generamos la etiqueta superior
  let headerLabel = ''
  if (isCompleted) {
    headerLabel = isPurchase ? 'COMPRA COMPLETADA' : 'INTERCAMBIO COMPLETADO'
  } else {
    if (isPurchase) {
      headerLabel = amIRequester ? 'COMPRA (YO INTERESADO)' : `COMPRA (${userName.toUpperCase()} INTERESADO)`
    } else {
      headerLabel = amIRequester ? 'INTERCAMBIO (ENVIADO)' : 'INTERCAMBIO (RECIBIDO)'
    }
  }

  function handleChat() {
    navigate(`/intercambios/${exchangeId}/chat`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[11px] font-black text-brand tracking-widest">{headerLabel}</h3>
        <StatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
          {isPurchase ? (
            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRODUCTO</p>
              <ProductMini pub={productoComprado} fallbackText="Producto eliminado" />
            </div>
          ) : (
            <>
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRODUCTO A ENVIAR</p>
                <ProductMini pub={productoEnviar} fallbackText="Tu producto fue eliminado" />
              </div>
              <div className="hidden sm:flex shrink-0 items-center justify-center mt-6">
                <div className="bg-slate-50 p-2 rounded-full border border-slate-100">
                  <ArrowRightLeft className="text-slate-400 w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRODUCTO A RECIBIR</p>
                <ProductMini pub={productoRecibir} fallbackText="El producto fue eliminado" />
              </div>
            </>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Precio / Diferencia */}
            {isPurchase ? (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PRECIO</p>
                <p className="text-sm font-black text-emerald-600">${precio.toLocaleString('es-AR')}</p>
              </div>
            ) : complementaryAmount > 0 ? (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">$ ADICIONAL</p>
                <p className="text-sm font-black text-emerald-600">${complementaryAmount.toLocaleString('es-AR')}</p>
              </div>
            ) : null}

            {/* Usuario */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">USUARIO</p>
              <div className="flex items-center gap-2">
                {otherUser?.photo ? (
                  <img src={otherUser.photo} alt={userName} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[8px] font-bold">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700">{userName}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleChat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ver chat
            </button>

            {isCompleted && !hasRated && onCalificar && (
              <button
                onClick={() => onCalificar(exchange)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors border border-amber-200"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Calificar
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
