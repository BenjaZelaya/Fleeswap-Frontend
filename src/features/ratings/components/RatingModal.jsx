import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { enviarCalificacion } from '../services/ratingService'

// Palabras clave para detectar el error de "ya calificado" del backend
const YA_CALIFICADO_KEYWORDS = [
  'ya calificaste',
  'ya has calificado',
  'ya existe',
  'duplicate',
  'already rated',
]

function isYaCalificadoError(msg = '') {
  return YA_CALIFICADO_KEYWORDS.some((kw) => msg.toLowerCase().includes(kw))
}

export default function RatingModal({
  isOpen,
  onClose,
  exchangeId,
  otherUserName,
  itemName,
  onSuccess
}) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  // Resetear estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setHoverRating(0)
      setComment('')
      setIsSubmitting(false)
      setAlreadyRated(false)
    }
  }, [isOpen])

  const handleAlreadyRated = () => {
    // Marcar como calificado en la UI sin mostrar error
    setAlreadyRated(true)
    if (onSuccess) onSuccess() // Actualiza el botón de la card a "Ya calificaste"
    setTimeout(() => onClose(), 1800) // Cierra el modal suavemente tras ver el mensaje
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || isSubmitting || alreadyRated) return

    setIsSubmitting(true)

    try {
      await enviarCalificacion(exchangeId, rating, comment)
      toast.success('¡Gracias por tu calificación!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || ''
      const status = err.response?.status

      if (isYaCalificadoError(msg) || status === 409) {
        // El backend confirma que ya calificó: sincronizamos el estado local
        handleAlreadyRated()
      } else {
        // Error real (vencimiento de plazo, red, etc.)
        const friendlyMsg = msg || 'Hubo un error al enviar tu calificación.'
        toast.error(friendlyMsg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!alreadyRated && rating === 0) {
      // Solo muestra el recordatorio si el usuario cerró sin calificar
      toast.info('Tenés 7 días para dejar tu calificación desde tu historial.')
    }
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100"
          />

          {/* Contenedor del Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-101 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  Califica tu experiencia
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body: estado "ya calificado" */}
              {alreadyRated ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 px-6 text-center"
                >
                  <CheckCircle size={52} className="text-emerald-500 mb-4" />
                  <p className="text-base font-bold text-slate-800 mb-1">
                    ¡Ya calificaste a {otherUserName}!
                  </p>
                  <p className="text-sm text-slate-400">
                    Tu reseña ya fue registrada anteriormente.
                  </p>
                </motion.div>
              ) : (
                /* Body: formulario normal */
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="text-center mb-8">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Con <span className="text-brand-accent font-bold">{otherUserName}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Por el trueque/compra de: {itemName}
                    </p>
                  </div>

                  {/* Estrellas Interactivas */}
                  <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating)
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform active:scale-90 p-1"
                        >
                          <Star
                            size={40}
                            className={`transition-colors duration-200 ${active
                              ? 'fill-brand text-brand'
                              : 'fill-transparent text-slate-200 hover:text-slate-300'
                              }`}
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Comentario */}
                  <div className="mb-6">
                    <label htmlFor="rating-comment" className="block text-sm font-semibold text-slate-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      id="rating-comment"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="¿Cómo fue tu experiencia? ¿Recomendás a este usuario?"
                      maxLength={500}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px] text-slate-400">
                        {comment.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Ahora no
                    </button>
                    <button
                      type="submit"
                      disabled={rating === 0 || isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-light rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Calificación'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
