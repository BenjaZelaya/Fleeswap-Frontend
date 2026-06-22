import { useState } from 'react'
import { MessageSquare, Star } from 'lucide-react'
import { toast } from 'sonner'
import { aceptarSolicitud, rechazarSolicitud, confirmarIntercambio, cancelarIntercambio } from '../../services/solicitudService'
import ConfirmModal from '../../../../shared/components/ui/ConfirmModal'
import RatingModal from '../../../ratings/components/RatingModal'

export default function ExchangeActions({
  exchange,
  amIRequester,
  isPurchase,
  isCompleted,
  userName,
  otherUser,
  user,
  onUpdateSuccess,
  onNavigate
}) {
  const { _id, id, status, confirmedByOwner, confirmedByRequester } = exchange
  const exchangeId = _id || id

  const [isUpdating, setIsUpdating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [modalConfig, setModalConfig] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)

  const [hasRatedLocally, setHasRatedLocally] = useState(() => {
    if (!user) return false
    const rated = localStorage.getItem(`rated_exchanges_${user.id || user._id}`)
    if (rated) {
      const parsed = JSON.parse(rated)
      return parsed.includes(exchangeId)
    }
    return false
  })

  // Comprobar si este lado confirmó
  const iConfirmed = amIRequester ? confirmedByRequester : confirmedByOwner
  // Comprobar si falta que el otro confirme
  const otherConfirmed = amIRequester ? confirmedByOwner : confirmedByRequester
  const waitingForOther = iConfirmed && !otherConfirmed

  const handleChat = () => onNavigate(`/intercambios/${exchangeId}/chat`)

  const executeDecision = async (decision) => {
    setIsUpdating(true)
    try {
      if (decision === 'accepted') {
        await aceptarSolicitud(exchangeId)
        toast.success(isPurchase ? '¡Propuesta aceptada! El chat está listo.' : 'Solicitud aceptada con éxito')
      } else {
        await rechazarSolicitud(exchangeId)
        toast.success(isPurchase ? 'Propuesta de compra rechazada' : 'Solicitud rechazada')
      }
      if (onUpdateSuccess) onUpdateSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ocurrió un error al procesar tu decisión.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDecision = (decision) => {
    const isAccept = decision === 'accepted'
    setModalConfig({
      title: isPurchase
        ? (isAccept ? '¿Aceptar propuesta de compra?' : '¿Rechazar propuesta?')
        : (isAccept ? '¿Aceptar propuesta?' : '¿Rechazar propuesta?'),
      message: isAccept
        ? (isPurchase
          ? `${userName} quiere comprar tu publicación. Al aceptar, se habilitará el chat para coordinar la entrega.`
          : `Estás a punto de aceptar el intercambio con ${userName}. Las demás ofertas por tu artículo serán rechazadas automáticamente.`)
        : (isPurchase
          ? `La solicitud de compra de ${userName} será descartada.`
          : `Esta acción no se puede deshacer. La propuesta de ${userName} será descartada.`),
      confirmText: isAccept ? 'Sí, aceptar' : 'Sí, rechazar',
      variant: isAccept ? 'default' : 'danger',
      onConfirm: () => {
        setModalConfig(null)
        executeDecision(decision)
      }
    })
  }

  const handleConfirmar = () => {
    setModalConfig({
      title: isPurchase ? '¿Confirmar venta?' : '¿Confirmar entrega?',
      message: isPurchase
        ? '¿Confirmás que la venta se realizó exitosamente? El producto quedará marcado como vendido.'
        : '¿Estás seguro de que ya recibiste el artículo y querés dar por finalizado el trueque?',
      confirmText: isPurchase ? 'Sí, confirmar venta' : 'Sí, confirmar entrega',
      variant: 'default',
      onConfirm: async () => {
        setIsConfirming(true)
        setModalConfig(null)
        try {
          const respuesta = await confirmarIntercambio(exchangeId)
          if (respuesta.status === 'completed') {
            toast.success(isPurchase ? '¡Venta completada! El producto fue marcado como vendido.' : '¡Excelente! El intercambio se ha completado.')
            setShowRatingModal(true)
          } else {
            toast.info('Confirmación registrada. Esperando a la otra parte.')
          }
          if (onUpdateSuccess) onUpdateSuccess()
        } catch (error) {
          toast.error(error.response?.data?.message || 'Error al confirmar.')
        } finally {
          setIsConfirming(false)
        }
      }
    })
  }

  const handleCancelar = () => {
    setModalConfig({
      title: isPurchase ? '¿Cancelar venta?' : '¿Cancelar intercambio?',
      message: isPurchase
        ? '¿Cancelás esta venta? El producto volverá a estar disponible.'
        : '¿Estás seguro de que querés cancelar este intercambio? Los artículos volverán a estar disponibles.',
      confirmText: isPurchase ? 'Sí, cancelar venta' : 'Sí, cancelar',
      variant: 'danger',
      onConfirm: async () => {
        setIsCanceling(true)
        setModalConfig(null)
        try {
          await cancelarIntercambio(exchangeId)
          toast.success(isPurchase ? 'Venta cancelada exitosamente.' : 'El intercambio ha sido cancelado.')
          if (onUpdateSuccess) onUpdateSuccess()
        } catch (error) {
          toast.error(error.response?.data?.message || 'Hubo un error al intentar cancelar.')
        } finally {
          setIsCanceling(false)
        }
      }
    })
  }

  const handleRatingSuccess = () => {
    setHasRatedLocally(true)
    if (user) {
      const key = `rated_exchanges_${user.id || user._id}`
      const rated = JSON.parse(localStorage.getItem(key) || '[]')
      rated.push(exchangeId)
      localStorage.setItem(key, JSON.stringify(rated))
    }
    if (onUpdateSuccess) onUpdateSuccess()
  }

  return (
    <>
      <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
        {/* Si está en pendiente y yo NO soy el requester (soy el dueño), puedo Aceptar/Rechazar */}
        {status === 'pending' && !amIRequester && (
          <>
            <button
              onClick={() => handleDecision('rejected')}
              disabled={isUpdating}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              onClick={() => handleDecision('accepted')}
              disabled={isUpdating}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-brand rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              Aceptar
            </button>
          </>
        )}

        {/* Si está en pendiente y yo SÍ soy el requester, solo puedo cancelar mi propuesta */}
        {status === 'pending' && amIRequester && (
          <button
            onClick={handleCancelar}
            disabled={isCanceling}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            Cancelar Propuesta
          </button>
        )}

        {/* Si está activo (en curso) */}
        {status === 'active' && (
          <>
            {!iConfirmed ? (
              <button
                onClick={handleConfirmar}
                disabled={isConfirming}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                Confirmar {isPurchase ? 'Venta' : 'Entrega'}
              </button>
            ) : waitingForOther ? (
              <div className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl">
                Esperando confirmación del otro usuario...
              </div>
            ) : null}

            {!iConfirmed && (
              <button
                onClick={handleCancelar}
                disabled={isCanceling}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            )}

            <button
              onClick={handleChat}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-brand bg-brand/10 rounded-xl hover:bg-brand/20 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Chat
            </button>
          </>
        )}

        {/* Si está completado */}
        {isCompleted && (
          <>
            {!(exchange.hasRated || hasRatedLocally) && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Star size={16} className="fill-current" />
                Calificar Usuario
              </button>
            )}
            <button
              onClick={handleChat}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-brand bg-brand/10 rounded-xl hover:bg-brand/20 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Chat
            </button>
          </>
        )}

        {/* Si está cancelado o rechazado */}
        {(status === 'cancelled' || status === 'rejected') && (
          <button
            onClick={handleChat}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            Historial
          </button>
        )}
      </div>

      <ConfirmModal
        open={!!modalConfig}
        onClose={() => setModalConfig(null)}
        title={modalConfig?.title}
        message={modalConfig?.message}
        onConfirm={modalConfig?.onConfirm}
        confirmText={modalConfig?.confirmText}
        variant={modalConfig?.variant}
        isDangerous={modalConfig?.variant === 'danger'}
        cancelText="Cancelar"
      />

      <RatingModal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSuccess={handleRatingSuccess}
        exchangeId={exchangeId}
        targetUserId={otherUser?._id || otherUser?.id}
      />
    </>
  )
}
