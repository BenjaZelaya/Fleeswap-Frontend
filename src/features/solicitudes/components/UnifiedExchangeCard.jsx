// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { formatCurrency } from '../../../shared/utils/formatters'
import ExchangeStatusBadge from './exchange-card/ExchangeStatusBadge'
import ExchangeProductMini from './exchange-card/ExchangeProductMini'
import ExchangeActions from './exchange-card/ExchangeActions'

export default function UnifiedExchangeCard({ exchange, onUpdateSuccess, onCalificar }) {
  const navigate = useNavigate()

  const { source, type, status, complementaryAmount = 0 } = exchange
  const isPurchase = type === 'purchase'
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
  if (isPurchase) {
    const action = amIRequester ? 'COMPRA' : 'VENTA'
    if (status === 'completed') {
      headerLabel = `${action} COMPLETADA`
    } else if (status === 'cancelled' || status === 'rejected') {
      headerLabel = `${action} CANCELADA`
    } else {
      headerLabel = amIRequester ? 'COMPRA EN CURSO' : `VENTA (${userName.toUpperCase()} ESTÁ INTERESADO)`
    }
  } else {
    if (status === 'completed') {
      headerLabel = 'INTERCAMBIO COMPLETADO'
    } else if (status === 'cancelled' || status === 'rejected') {
      headerLabel = 'INTERCAMBIO CANCELADO'
    } else {
      headerLabel = amIRequester ? 'INTERCAMBIO (ENVIADO)' : 'INTERCAMBIO (RECIBIDO)'
    }
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
        <ExchangeStatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full">
          {isPurchase ? (
            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {amIRequester ? 'PRODUCTO A COMPRAR' : 'PRODUCTO A VENDER'}
              </p>
              <ExchangeProductMini pub={productoComprado} fallbackText="Producto eliminado" />
            </div>
          ) : (
            <>
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRODUCTO A ENVIAR</p>
                <ExchangeProductMini pub={productoEnviar} fallbackText="Tu producto fue eliminado" />
              </div>
              <div className="hidden sm:flex shrink-0 items-center justify-center mt-6">
                <div className="bg-slate-50 p-2 rounded-full border border-slate-100">
                  <ArrowRightLeft className="text-slate-400 w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">PRODUCTO A RECIBIR</p>
                <ExchangeProductMini pub={productoRecibir} fallbackText="El producto fue eliminado" />
              </div>
            </>
          )}
        </div>

        {/* Info del usuario y acciones */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100">
          <Link
            to={`/profile/${otherUser?._id || otherUser?.id}`}
            className="flex items-center gap-3 group"
          >
            {otherUser?.photo ? (
              <img src={otherUser.photo} alt={userName} className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:border-brand/30 transition-colors" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-brand/30 transition-colors">
                <span className="text-sm font-bold text-slate-400 group-hover:text-brand transition-colors">{userName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 font-medium group-hover:text-slate-600 transition-colors">Contraparte</p>
              <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{userName}</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {/* Precio / Diferencia */}
            {isPurchase ? (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PRECIO</p>
                <p className="text-sm font-black text-emerald-600">{formatCurrency(precio)}</p>
              </div>
            ) : complementaryAmount > 0 ? (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">$ ADICIONAL</p>
                <p className="text-sm font-black text-emerald-600">{formatCurrency(complementaryAmount)}</p>
              </div>
            ) : null}
          </div>

          {/* Botones de acción */}
          <ExchangeActions
            exchange={exchange}
            userName={userName}
            otherUser={otherUser}
            onUpdateSuccess={onUpdateSuccess}
            onNavigate={navigate}
            onCalificar={onCalificar}
          />
        </div>
      </div>
    </motion.div>
  )
}
