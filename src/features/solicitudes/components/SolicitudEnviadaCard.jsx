import { useState } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { confirmarIntercambio, cancelarIntercambio } from '../services/solicitudService'
import { BADGE, CARD_ACCENT, BADGE_LABEL_PURCHASE, BADGE_LABEL_EXCHANGE, cardVariants } from '../utils/constants'
import ProductMini from './ProductMini'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'

export default function SolicitudEnviadaCard({ solicitud, onUpdateSuccess }) {
  const {
    owner, offeredPublication, requestedPublication,
    status, complementaryAmount, createdAt,
    confirmedByRequester, confirmedByOwner,
    type = 'exchange',
  } = solicitud

  const isPurchase = type === 'purchase'
  const BADGE_LABELS = isPurchase ? BADGE_LABEL_PURCHASE : BADGE_LABEL_EXCHANGE

  const [isConfirming, setIsConfirming] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [modalConfig, setModalConfig] = useState(null)

  const initial = owner?.nombre?.[0]?.toUpperCase() ?? '?'
  const name = [owner?.nombre, owner?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const fecha = createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const accent = CARD_ACCENT[status] ?? 'border-l-4 border-l-slate-200'

  const handleConfirmar = () => {
    // Solo aplicable en intercambios (el comprador puede confirmar recepción)
    setModalConfig({
      title: '¿Confirmar recepción?',
      message: '¿Estás seguro de que ya recibiste el artículo y querés dar por finalizado el trueque?',
      confirmText: 'Sí, confirmar',
      variant: 'default',
      onConfirm: async () => {
        setIsConfirming(true)
        setModalConfig(null)
        try {
          const respuesta = await confirmarIntercambio(solicitud._id || solicitud.id)
          if (respuesta.status === 'completed') {
            toast.success('¡Excelente! El intercambio se ha completado.')
          } else {
            toast.info('Confirmación registrada. Esperando a la otra parte.')
          }
          if (onUpdateSuccess) onUpdateSuccess()
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error al confirmar el intercambio.')
        } finally {
          setIsConfirming(false)
        }
      }
    })
  }

  const handleCancelar = () => {
    const isPending = status === 'pending'
    setModalConfig({
      title: isPurchase
        ? (isPending ? '¿Retirar propuesta de compra?' : '¿Cancelar compra?')
        : (isPending ? '¿Retirar propuesta?' : '¿Cancelar intercambio?'),
      message: isPurchase
        ? (isPending
            ? 'Se retirará tu solicitud de compra. El producto volverá a estar disponible para otros usuarios.'
            : '¿Cancelás esta compra? El producto volverá a estar disponible.')
        : (isPending
            ? '¿Retirás esta propuesta de intercambio? Podrás proponer otra más adelante.'
            : '¿Cancelás este intercambio? Los artículos volverán a estar disponibles.'),
      confirmText: isPending ? 'Sí, retirar' : 'Sí, cancelar',
      variant: 'danger',
      onConfirm: async () => {
        setIsCanceling(true)
        setModalConfig(null)
        try {
          await cancelarIntercambio(solicitud._id || solicitud.id)
          toast.success(
            isPending
              ? (isPurchase ? 'Propuesta de compra retirada.' : 'Propuesta retirada con éxito.')
              : (isPurchase ? 'Compra cancelada exitosamente.' : 'Intercambio cancelado exitosamente.')
          )
          if (onUpdateSuccess) onUpdateSuccess()
        } catch (error) {
          toast.error(error.response?.data?.message || 'Hubo un error al procesar la cancelación.')
        } finally {
          setIsCanceling(false)
        }
      }
    })
  }

  return (
    <motion.div layout variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.10)' }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${accent}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/40">
        <Link to={`/profile/${owner?._id ?? owner?.id}`} className="flex items-center gap-2.5 group min-w-0">
          {owner?.photo
            ? <img src={owner.photo} alt={name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
            : <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-accent transition-colors truncate">{name}</p>
            <p className="text-[10px] text-slate-400 font-light">
              {isPurchase ? 'tiene lo que querés comprar' : 'tiene lo que buscás'}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Badge de tipo (solo si no está finalizado) */}
          {(status === 'pending' || status === 'active') && (
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isPurchase ? 'bg-brand/10 text-brand' : 'bg-blue-50 text-blue-600'
            }`}>
              {isPurchase ? 'Compra' : 'Intercambio'}
            </span>
          )}
          {fecha && <span className="hidden sm:block text-[10px] font-light text-slate-400">{fecha}</span>}
          {status !== 'active' && status !== 'completed' && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BADGE[status] ?? 'bg-slate-100 text-slate-500'}`}>
              {BADGE_LABELS[status] ?? status}
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      {isPurchase ? (
        // COMPRA: solo muestra lo que querés comprar
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" /> Lo que querés comprar
          </p>
          <ProductMini photo={requestedPublication?.photos?.[0]} title={requestedPublication?.title} />
          {(requestedPublication?._id ?? requestedPublication?.id) && (
            <Link to={`/publications/${requestedPublication?._id ?? requestedPublication?.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-accent hover:underline">
              Ver publicación →
            </Link>
          )}
        </div>
      ) : (
        // INTERCAMBIO: muestra ambas publicaciones
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block" /> Lo que ofreciste
            </p>
            <ProductMini photo={offeredPublication?.photos?.[0]} title={offeredPublication?.title} />
            {complementaryAmount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                + ${complementaryAmount.toLocaleString('es-AR')} complementario
              </span>
            )}
          </div>
          <div className="p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" /> Lo que querés
            </p>
            <ProductMini photo={requestedPublication?.photos?.[0]} title={requestedPublication?.title} />
            {(requestedPublication?._id ?? requestedPublication?.id) && (
              <Link to={`/publications/${requestedPublication?._id ?? requestedPublication?.id}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-accent hover:underline">
                Ver publicación →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/30">
        <AnimatePresence mode="wait">

          {/* PENDIENTE: solo retirar propuesta */}
          {status === 'pending' ? (
            <motion.div key="pending-actions" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex justify-end w-full">
              <button
                onClick={handleCancelar}
                disabled={isCanceling}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all border border-red-100 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isCanceling ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Retirando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {isPurchase ? 'Retirar Propuesta de Compra' : 'Retirar Propuesta'}
                  </>
                )}
              </button>
            </motion.div>

          ) : status === 'active' ? (
            <motion.div key="active-actions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="w-full space-y-3">
              {/* Estado */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isPurchase ? 'text-brand bg-brand/5 border-brand/20' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    {isPurchase
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    }
                  </svg>
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {isPurchase ? 'Compra en curso' : 'Intercambio activo'}
                  </span>
                </div>
                {!isPurchase && confirmedByOwner && (
                  <motion.span initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmado por el vendedor
                  </motion.span>
                )}
              </div>

              {/* Botones */}
              <div className={`grid gap-2 ${!isPurchase ? 'grid-cols-1 sm:grid-cols-2' : ''}`}>
                {/* Chat */}
                <Link
                  to={`/intercambios/${solicitud._id || solicitud.id}/chat`}
                  className="group flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-light text-white font-bold py-3 px-4 rounded-2xl transition-all text-sm shadow-[0_4px_14px_0_rgba(99,102,241,0.30)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  {isPurchase ? 'Ir al chat de compra' : 'Coordinar Intercambio'}
                </Link>

                {/* Confirmar (solo intercambio) */}
                {!isPurchase && (
                  !confirmedByRequester ? (
                    <motion.button initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={handleConfirmar} disabled={isConfirming || isCanceling}
                      className="flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl transition-all text-sm shadow-[0_4px_14px_0_rgba(16,185,129,0.30)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                    >
                      {isConfirming ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {isConfirming ? 'Confirmando...' : 'Confirmar Recepción'}
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-3 px-4 rounded-2xl text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Esperando al vendedor...
                    </div>
                  )
                )}

                {/* En compras: badge de espera al vendedor */}
                {isPurchase && (
                  <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-semibold py-2.5 px-4 rounded-2xl text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    El vendedor debe confirmar la venta
                  </div>
                )}
              </div>

              {/* Cancelar */}
              <div className="flex justify-end pt-0.5">
                <button onClick={handleCancelar} disabled={isCanceling || isConfirming}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {isCanceling ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {isCanceling ? 'Cancelando...' : (isPurchase ? 'Cancelar compra' : 'Cancelar intercambio')}
                </button>
              </div>
            </motion.div>

          ) : status === 'completed' ? (
            <motion.div key="badge-completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <div className="w-full flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl bg-purple-100 text-purple-800 border border-purple-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isPurchase ? 'Compra completada' : 'Intercambio completado'}
              </div>
            </motion.div>

          ) : null}
        </AnimatePresence>
      </div>

      <ConfirmModal
        open={!!modalConfig}
        onClose={() => setModalConfig(null)}
        onConfirm={modalConfig?.onConfirm}
        title={modalConfig?.title}
        message={modalConfig?.message}
        confirmText={modalConfig?.confirmText}
        variant={modalConfig?.variant}
        loading={isConfirming || isCanceling}
      />
    </motion.div>
  )
}
