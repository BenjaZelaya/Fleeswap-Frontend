/**
 * ModalIntercambio
 *
 * Ventana emergente que permite al usuario autenticado enviar una solicitud
 * de intercambio por una publicación ajena.
 *
 */

import { useState, useEffect, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { enviarSolicitud, getMisPublicaciones } from '../services/solicitudService'

// ── Constantes de animación ────────────────────────────────────────────────
const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const MODAL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit: { opacity: 0, scale: 0.92, y: 16, transition: { duration: 0.18 } },
}

export default function ModalIntercambio({ isOpen, onClose, publicacionDestino, publicacionesDestino }) {
  // ── Estado ─────────────────────────────────────────────────────────────
  const [misPublicaciones, setMisPublicaciones] = useState([])
  const [selectedDestinoId, setSelectedDestinoId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [monto, setMonto] = useState('')
  const [loadingPubs, setLoadingPubs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [montoError, setMontoError] = useState('')

  // Publicación propia seleccionada para previsualización
  const selectedPub = misPublicaciones.find((p) => p._id === selectedId) || null

  // Filtrar publicaciones destino si se abre desde el perfil
  const pubsDestinoFiltradas = useMemo(() => {
    if (!publicacionesDestino) return []
    return publicacionesDestino.filter(
      (p) =>
        (p.status === 'available' || p.status === 'activo') &&
        ['trueque', 'ambos'].includes(p.type?.toLowerCase())
    )
  }, [publicacionesDestino])

  // Publicación destino activa (fija o seleccionada)
  const activeDestinoPub = publicacionDestino || pubsDestinoFiltradas.find((p) => p._id === selectedDestinoId) || null

  // ── Cargar publicaciones del usuario al abrir el modal ─────────────────
  useEffect(() => {
    if (!isOpen) return

    // Reset del formulario cada vez que se abre
    setSelectedDestinoId('')
    setSelectedId('')
    setMonto('')
    setMontoError('')

    async function fetchMisPublicaciones() {
      setLoadingPubs(true)
      try {
        const data = await getMisPublicaciones()
        // Solo publicaciones disponibles y que admiten intercambio (trueque o ambos)
        const activas = (data.publications ?? data).filter(
          (p) =>
            (p.status === 'available' || p.status === 'activo') &&
            ['trueque', 'ambos'].includes(p.type?.toLowerCase())
        )
        setMisPublicaciones(activas)
      } catch {
        toast.error('No se pudieron cargar tus publicaciones')
      } finally {
        setLoadingPubs(false)
      }
    }

    fetchMisPublicaciones()
  }, [isOpen])

  // ── Handlers ───────────────────────────────────────────────────────────
  function handleMontoChange(e) {
    const value = e.target.value
    setMonto(value)
    if (value !== '' && Number(value) < 0) {
      setMontoError('El monto no puede ser negativo')
    } else {
      setMontoError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Guardia: producto seleccionado origen
    if (!selectedId) return

    // Guardia: producto destino seleccionado (si viene de perfil)
    if (!publicacionDestino && !selectedDestinoId) return

    const destinoIdFinal = publicacionDestino ? publicacionDestino._id : selectedDestinoId

    // Guardia: monto negativo
    const montoNum = monto === '' ? 0 : Number(monto)
    if (montoNum < 0) {
      setMontoError('El monto no puede ser negativo')
      return
    }

    setIsSubmitting(true)
    try {
      await enviarSolicitud({
        requestedPublicationId: destinoIdFinal,
        offeredPublicationId: selectedId,
        complementaryAmount: montoNum,
      })
      toast.success('¡Propuesta enviada! El dueño recibirá una notificación por correo.')
      onClose()
    } catch (err) {
      const status = err.response?.status

      if (status === 409) {
        toast.warning('Ya tienes una propuesta pendiente para este artículo.')
      } else if (status === 401) {
        toast.error('Tu sesión expiró. Por favor, vuelve a iniciar sesión.')
      } else if (status === 400) {
        toast.error('Datos inválidos. Revisá los campos e intentá de nuevo.')
      } else {
        toast.error('Error al enviar la propuesta. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        // Overlay
        <motion.div
          key="overlay"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          {/* Panel del modal — stopPropagation evita cerrar al hacer click dentro */}
          <motion.div
            key="modal"
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Proponer Intercambio</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                  {publicacionesDestino ? 'Elegí el objeto que querés y lo que vas a ofrecer' : (
                    <>Por: <span className="font-semibold text-gray-700">{publicacionDestino?.title}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Cuerpo del formulario ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Selector Destino (Si viene del perfil) */}
              {publicacionesDestino && (
                <div>
                  <label htmlFor="selector-destino" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    ¿Qué querés obtener? <span className="text-red-500">*</span>
                  </label>
                  {pubsDestinoFiltradas.length === 0 ? (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Este usuario no tiene artículos disponibles para trueque.
                    </div>
                  ) : (
                    <select
                      id="selector-destino"
                      value={selectedDestinoId}
                      onChange={(e) => setSelectedDestinoId(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
                    >
                      <option value="" disabled>— Seleccioná un artículo —</option>
                      {pubsDestinoFiltradas.map((pub) => (
                        <option key={pub._id} value={pub._id}>{pub.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Previsualización del producto destino */}
              <AnimatePresence>
                {activeDestinoPub && (
                  <motion.div
                    key="destino-preview"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      {activeDestinoPub.photos?.[0] ? (
                        <img
                          src={activeDestinoPub.photos[0]}
                          alt={activeDestinoPub.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Querés obtener</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{activeDestinoPub.title}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selector de publicación propia */}
              <div>
                <label htmlFor="selector-pub" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tu publicación a ofrecer <span className="text-red-500">*</span>
                </label>

                {loadingPubs ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando tus publicaciones...
                  </div>
                ) : misPublicaciones.length === 0 ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    No tenés publicaciones activas para ofrecer.
                  </p>
                ) : (
                  <select
                    id="selector-pub"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
                  >
                    <option value="" disabled>— Seleccioná un producto —</option>
                    {misPublicaciones.map((pub) => (
                      <option key={pub._id} value={pub._id}>{pub.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Previsualización del producto seleccionado */}
              <AnimatePresence>
                {selectedPub && (
                  <motion.div
                    key={selectedPub._id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 bg-brand/5 rounded-xl p-3 border border-brand/20">
                      {selectedPub.photos?.[0] ? (
                        <img
                          src={selectedPub.photos[0]}
                          alt={selectedPub.title}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-brand/10 shrink-0 flex items-center justify-center text-brand">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-brand font-medium uppercase tracking-wide">Ofrecés</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedPub.title}</p>
                        {selectedPub.condition && (
                          <p className="text-xs text-gray-500 capitalize">{selectedPub.condition}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Campo de monto adicional */}
              <div>
                <label htmlFor="monto-adicional" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Dinero adicional <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">$</span>
                  <input
                    id="monto-adicional"
                    type="number"
                    min="0"
                    step="1"
                    value={monto}
                    onChange={handleMontoChange}
                    placeholder="0"
                    className={`w-full border rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition ${montoError
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-brand/40 focus:border-brand'
                      }`}
                  />
                </div>
                {montoError && (
                  <p className="text-xs text-red-500 mt-1">{montoError}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Podés sumar dinero a tu oferta para hacerla más atractiva.
                </p>
              </div>

              {/* Aviso de notificación */}
              <div className="flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2.5 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-700">
                  El dueño de la publicación recibirá una notificación por correo electrónico con tu propuesta.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedId || (!publicacionDestino && !selectedDestinoId) || isSubmitting || !!montoError || (publicacionesDestino && pubsDestinoFiltradas.length === 0)}
                  className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Enviar propuesta
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
