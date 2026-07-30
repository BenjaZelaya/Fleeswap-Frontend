import { useState, useEffect, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { enviarSolicitud, getMisPublicaciones } from '../services/solicitudService'
import { PUBLICATION_TYPES, PUBLICATION_AVAILABLE_STATUSES } from '../../../shared/utils/constants'
import { formatCurrency } from '../../../shared/utils/formatters'

// ── Constantes de animación ────────────────────────────────────────────────
const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const MODAL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
}

const STEP_VARIANTS = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// ── Sub-componente: Tarjeta Seleccionable ──────────────────────────────────
function SelectableCard({ pub, isSelected, onSelect }) {
  const typeLabel = PUBLICATION_TYPES.find(t => t.value === pub.type)?.label || pub.type

  return (
    <div
      onClick={() => onSelect(pub._id || pub.id)}
      className={`relative cursor-pointer group rounded-xl border-2 transition-all duration-200 overflow-hidden ${isSelected
        ? 'border-brand bg-brand/5 ring-4 ring-brand/10'
        : 'border-slate-100 bg-white hover:border-brand/30'
        }`}
    >
      <div className="aspect-square bg-slate-50 relative">
        {pub.photos?.[0] ? (
          <img src={pub.photos[0]} alt={pub.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-brand text-white rounded-full p-1 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-bold text-gray-900 truncate leading-tight mb-1">{pub.title}</p>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${pub.type === 'trueque' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
          }`}>
          {typeLabel}
        </span>
      </div>
    </div>
  )
}

export default function ModalIntercambio({ isOpen, onClose, publicacionDestino, publicacionesDestino }) {
  // ── Estado ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [misPublicaciones, setMisPublicaciones] = useState([])
  const [selectedDestinoId, setSelectedDestinoId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [monto, setMonto] = useState('')
  const [loadingPubs, setLoadingPubs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtrar publicaciones destino
  const pubsDestinoFiltradas = useMemo(() => {
    if (!publicacionesDestino) return []
    return publicacionesDestino.filter(
      (p) =>
        (!p.status || PUBLICATION_AVAILABLE_STATUSES.includes(p.status.toLowerCase())) &&
        ['trueque', 'ambos'].includes(p.type?.toLowerCase())
    )
  }, [publicacionesDestino])

  const activeDestinoPub = publicacionDestino || pubsDestinoFiltradas.find((p) => (p._id || p.id) === selectedDestinoId) || null
  const selectedPub = misPublicaciones.find((p) => (p._id || p.id) === selectedId) || null

  // ── Inicialización ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    // Reset
    setSelectedDestinoId('')
    setSelectedId('')
    setMonto('')

    // Si ya viene con destino, empezamos en el paso 2
    if (publicacionDestino) {
      setStep(2)
    } else {
      setStep(1)
    }

    async function fetchMisPublicaciones() {
      setLoadingPubs(true)
      try {
        const data = await getMisPublicaciones()
        const activas = (data.publications ?? data).filter(
          (p) =>
            (!p.status || PUBLICATION_AVAILABLE_STATUSES.includes(p.status.toLowerCase())) &&
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
  }, [isOpen, publicacionDestino])

  // ── Handlers ───────────────────────────────────────────────────────────
  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  // Autocalcular diferencia si ambos productos tienen precio (tipo 'ambos' o 'venta')
  useEffect(() => {
    if (activeDestinoPub && selectedPub) {
      const pDestino = activeDestinoPub.price || activeDestinoPub.precio || 0
      const pMio = selectedPub.price || selectedPub.precio || 0

      if (pDestino > 0 && pMio > 0) {
        const diff = Math.abs(pDestino - pMio)
        setMonto(diff.toString())
      }
    }
  }, [activeDestinoPub, selectedPub])

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!selectedId || (!publicacionDestino && !selectedDestinoId)) return

    const destinoIdFinal = publicacionDestino ? (publicacionDestino._id || publicacionDestino.id) : selectedDestinoId
    const montoNum = monto === '' ? 0 : Number(monto)

    setIsSubmitting(true)
    try {
      await enviarSolicitud({
        requestedPublicationId: destinoIdFinal,
        offeredPublicationId: selectedId,
        complementaryAmount: montoNum,
      })
      toast.success('¡Propuesta enviada con éxito!')
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al enviar la propuesta.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render Steps ───────────────────────────────────────────────────────

  const renderStep1 = () => (
    <motion.div variants={STEP_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">1. Elegí qué querés obtener</h3>
        <span className="text-[10px] font-bold text-slate-400">PASO 1 DE 3</span>
      </div>

      {pubsDestinoFiltradas.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-sm text-slate-500">Este usuario no tiene otros artículos para trueque.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {pubsDestinoFiltradas.map((pub) => (
            <SelectableCard
              key={pub._id || pub.id}
              pub={pub}
              isSelected={selectedDestinoId === (pub._id || pub.id)}
              onSelect={setSelectedDestinoId}
            />
          ))}
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={nextStep}
          disabled={!selectedDestinoId}
          className="w-full py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/20 disabled:opacity-40 disabled:shadow-none transition-all"
        >
          Continuar
        </button>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div variants={STEP_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          {publicacionDestino ? '1. Elegí qué vas a ofrecer' : '2. Elegí qué vas a ofrecer'}
        </h3>
        <span className="text-[10px] font-bold text-slate-400">
          {publicacionDestino ? 'PASO 1 DE 2' : 'PASO 2 DE 3'}
        </span>
      </div>

      {loadingPubs ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Cargando tus cosas...</p>
        </div>
      ) : misPublicaciones.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm text-slate-500">No tenés publicaciones activas para ofrecer.</p>
          <button onClick={onClose} className="text-xs font-bold text-brand hover:underline">Ir a crear una</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {misPublicaciones.map((pub) => (
            <SelectableCard
              key={pub._id || pub.id}
              pub={pub}
              isSelected={selectedId === (pub._id || pub.id)}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {!publicacionDestino && (
          <button
            onClick={prevStep}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Atrás
          </button>
        )}
        <button
          onClick={nextStep}
          disabled={!selectedId}
          className="flex-2 py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/20 disabled:opacity-40 disabled:shadow-none transition-all"
        >
          Siguiente
        </button>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div variants={STEP_VARIANTS} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">3. Detalles finales</h3>
        <span className="text-[10px] font-bold text-slate-400">PASO FINAL</span>
      </div>

      {/* Comparativa Visual */}
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
        <div className="flex-1 text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden shadow-sm border-2 border-white">
            <img src={activeDestinoPub?.photos?.[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-bold text-slate-800 truncate">{activeDestinoPub?.title}</p>
          {(activeDestinoPub?.price || activeDestinoPub?.precio) > 0 && (
            <p className="text-[11px] font-black text-emerald-600">{formatCurrency(activeDestinoPub.price || activeDestinoPub.precio)}</p>
          )}
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Recibís</span>
        </div>

        <div className="z-10 bg-white p-2 rounded-full shadow-md border border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        <div className="flex-1 text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden shadow-sm border-2 border-brand/30">
            <img src={selectedPub?.photos?.[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-bold text-slate-800 truncate">{selectedPub?.title}</p>
          {(selectedPub?.price || selectedPub?.precio) > 0 && (
            <p className="text-[11px] font-black text-emerald-600">{formatCurrency(selectedPub.price || selectedPub.precio)}</p>
          )}
          <span className="text-[9px] text-brand uppercase font-bold tracking-tighter">Entregás</span>
        </div>
      </div>

      {/* Monto Adicional */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 block">Dinero adicional a tu favor o en contra</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:border-brand/40 outline-none transition-all font-bold text-slate-700"
          />
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">Podés sumar dinero si considerás que tu producto vale menos que el otro, o dejarlo en 0 para un trueque directo.</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-2 py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/20 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Enviar Propuesta'
          )}
        </button>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          variants={OVERLAY_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
        >
          <motion.div
            key="modal"
            variants={MODAL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Proponer Trueque</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Steps */}
            <div className="relative min-h-100">
              <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
