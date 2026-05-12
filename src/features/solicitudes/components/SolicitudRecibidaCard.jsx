import { useState } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { aceptarSolicitud, rechazarSolicitud, confirmarIntercambio, cancelarIntercambio } from '../services/solicitudService'
import { BADGE, BADGE_LABEL, CARD_ACCENT, cardVariants } from '../utils/constants'
import ProductMini from './ProductMini'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'

export default function SolicitudRecibidaCard({ solicitud, onUpdateSuccess }) {
  const { requester, offeredPublication, requestedPublication, status, complementaryAmount, createdAt, confirmedByOwner, confirmedByRequester } = solicitud
  const [isUpdating, setIsUpdating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [modalConfig, setModalConfig] = useState(null)
  const initial = requester?.nombre?.[0]?.toUpperCase() ?? '?'
  const name = [requester?.nombre, requester?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const fecha = createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const accent = CARD_ACCENT[status] ?? 'border-l-4 border-l-slate-200'

  const executeDecision = async (decision) => {
    setIsUpdating(true)
    try {
      if (decision === 'accepted') {
        await aceptarSolicitud(solicitud._id || solicitud.id)
        toast.success('Solicitud aceptada con éxito')
      } else {
        await rechazarSolicitud(solicitud._id || solicitud.id)
        toast.success('Solicitud rechazada con éxito')
      }
      if (onUpdateSuccess) onUpdateSuccess()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ocurrió un error al procesar tu decisión.'
      toast.error(errorMsg)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleConfirmar = () => {
    setModalConfig({
      title: '¿Confirmar entrega?',
      message: '¿Estás seguro de que ya recibiste el artículo y quieres dar por finalizado el trueque?',
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
    setModalConfig({
      title: '¿Cancelar intercambio?',
      message: '¿Estás seguro de que deseas cancelar este intercambio? Los artículos volverán a estar disponibles para otros usuarios.',
      confirmText: 'Sí, cancelar',
      variant: 'danger',
      onConfirm: async () => {
        setIsCanceling(true)
        setModalConfig(null)
        try {
          await cancelarIntercambio(solicitud._id || solicitud.id)
          toast.success('El intercambio ha sido cancelado exitosamente.')
          if (onUpdateSuccess) onUpdateSuccess()
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Hubo un error al intentar cancelar.'
          toast.error(errorMsg)
        } finally {
          setIsCanceling(false)
        }
      }
    })
  }

  const handleDecision = (decision) => {
    const isAccept = decision === 'accepted'
    setModalConfig({
      title: isAccept ? '¿Aceptar propuesta?' : '¿Rechazar propuesta?',
      message: isAccept 
        ? `Estás a punto de aceptar el intercambio con ${name}. Las demás ofertas por tu artículo serán rechazadas automáticamente.`
        : `Esta acción no se puede deshacer. La propuesta de ${name} será descartada.`,
      confirmText: isAccept ? 'Sí, aceptar' : 'Sí, rechazar',
      variant: isAccept ? 'default' : 'danger',
      onConfirm: () => {
        setModalConfig(null)
        executeDecision(decision)
      }
    })
  }

  return (
    <motion.div layout variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.10)' }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${accent}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/40">
        <Link to={`/profile/${requester?._id ?? requester?.id}`} className="flex items-center gap-2.5 group min-w-0">
          {requester?.photo
            ? <img src={requester.photo} alt={name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
            : <div className="w-9 h-9 rounded-full bg-brand-accent flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-accent transition-colors truncate">{name}</p>
            <p className="text-[10px] text-slate-400 font-light">propone un intercambio</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {fecha && <span className="hidden sm:block text-[10px] font-light text-slate-400">{fecha}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block" /> Te ofrecen
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
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" /> Por tu
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

      <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/20 flex justify-end items-center min-h-[72px]">
        <AnimatePresence mode="wait">
          {status === 'pending' ? (
            <motion.div
              key="botones"
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-3 w-full sm:w-auto"
            >
              <button
                onClick={() => handleDecision('rejected')}
                disabled={isUpdating}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 font-semibold py-2 px-5 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
              <button
                onClick={() => handleDecision('accepted')}
                disabled={isUpdating}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl hover:bg-emerald-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5"
              >
                {isUpdating ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Aceptar
              </button>
            </motion.div>
          ) : status === 'active' ? (
            <motion.div
              key="active-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-tight">Intercambio en curso</span>
              </div>

              <AnimatePresence mode="wait">
                {!confirmedByOwner ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {confirmedByRequester && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 animate-bounce">
                        ¡La otra parte ya confirmó!
                      </span>
                    )}

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleCancelar}
                        disabled={isCanceling || isConfirming}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-500 font-semibold py-2 px-4 rounded-xl hover:bg-red-50 transition-all text-xs disabled:opacity-50"
                      >
                        {isCanceling ? (
                          <>
                            <svg className="animate-spin h-3 w-3 text-red-500" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancelar
                          </>
                        )}
                      </button>

                      <motion.button
                        key="btn-confirmar"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleConfirmar}
                        disabled={isConfirming || isCanceling}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand text-white font-bold py-2.5 px-6 rounded-xl hover:bg-brand-light transition-all text-sm shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {isConfirming ? (
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Confirmar Entrega
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    key="msg-espera"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-3"
                  >
                    <button
                      onClick={handleCancelar}
                      disabled={isCanceling}
                      className="text-[10px] text-red-400 hover:text-red-600 font-semibold hover:underline transition-colors disabled:opacity-50"
                    >
                      {isCanceling ? 'Cancelando...' : '¿Arrepentido? Cancelar intercambio'}
                    </button>
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold">Esperando confirmación de la otra parte...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="badge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className={`w-full flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl ${BADGE[status] ?? 'bg-slate-100 text-slate-500'}`}>
                {status === 'completed' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ¡Intercambio Completado Exitosamente!
                  </>
                ) : status === 'rejected' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Propuesta Rechazada
                  </>
                ) : (
                  BADGE_LABEL[status] ?? status
                )}
              </div>
            </motion.div>
          )}
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
        loading={isUpdating || isConfirming || isCanceling}
      />
    </motion.div>
  )
}
