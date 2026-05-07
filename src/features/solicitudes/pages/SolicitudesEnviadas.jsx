import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getSolicitudesEnviadas } from '../services/solicitudService'
import Seo from '../../../shared/components/Seo'
import { logError } from '../../../utils/logger'

const ESTADOS = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'active', label: 'Activas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

const BADGE = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  active: 'bg-blue-100  text-blue-800  border border-blue-200',
  rejected: 'bg-red-100   text-red-700   border border-red-200',
  completed: 'bg-purple-100 text-purple-800 border border-purple-200',
  cancelled: 'bg-slate-100 text-slate-600  border border-slate-200',
}
const BADGE_LABEL = {
  pending: 'Pendiente',
  active: 'Activa',
  rejected: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}
const CARD_ACCENT = {
  pending: 'border-l-4 border-l-amber-400',
  active: 'border-l-4 border-l-blue-400',
  rejected: 'border-l-4 border-l-red-300',
  completed: 'border-l-4 border-l-purple-400',
  cancelled: 'border-l-4 border-l-slate-300',
}

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function ProductMini({ photo, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
        {photo
          ? <img src={photo} alt={title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          : <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        }
      </div>
      <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{title ?? '—'}</p>
    </div>
  )
}

/**
 * Card desde la perspectiva del EMISOR.
 * Backend fields para /exchanges/sent:
 *   owner (el receptor), offeredPublication (lo que ofrecí),
 *   requestedPublication (lo que quiero), status, complementaryAmount
 */
function SolicitudEnviadaCard({ solicitud }) {
  const { owner, offeredPublication, requestedPublication, status, complementaryAmount, createdAt } = solicitud
  const initial = owner?.nombre?.[0]?.toUpperCase() ?? '?'
  const name = [owner?.nombre, owner?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const fecha = createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const accent = CARD_ACCENT[status] ?? 'border-l-4 border-l-slate-200'

  return (
    <motion.div layout variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.10)' }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${accent}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/40">
        <Link to={`/profile/${owner?._id ?? owner?.id}`} className="flex items-center gap-2.5 group min-w-0">
          {owner?.photo
            ? <img src={owner.photo} alt={name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
            : <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-accent transition-colors truncate">{name}</p>
            <p className="text-[10px] text-slate-400 font-light">tiene lo que buscás</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {fecha && <span className="hidden sm:block text-[10px] font-light text-slate-400">{fecha}</span>}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BADGE[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {BADGE_LABEL[status] ?? status}
          </span>
        </div>
      </div>

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
    </motion.div>
  )
}

function EmptyState({ filtro }) {
  const label = ESTADOS.find((e) => e.value === filtro)?.label?.toLowerCase() ?? filtro
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold">{filtro === 'all' ? 'Aún no enviaste solicitudes.' : `No tenés solicitudes ${label}.`}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">Explorá publicaciones y enviá tu primera propuesta.</p>
      <Link to="/explore" className="mt-6 text-sm font-semibold text-white bg-brand hover:bg-brand-light px-5 py-2.5 rounded-xl transition-colors">
        Explorar publicaciones
      </Link>
    </motion.div>
  )
}

export default function SolicitudesEnviadas() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const data = await getSolicitudesEnviadas()
        if (!cancelled) setSolicitudes(Array.isArray(data) ? data : (data?.exchanges ?? []))
      } catch (err) {
        logError('getSolicitudesEnviadas:', err)
        if (!cancelled) setError('No se pudieron cargar tus solicitudes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filtradas = filtro === 'all' ? solicitudes : solicitudes.filter((s) => s.status === filtro)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Seo title="Mis solicitudes enviadas · Fleeswap" description="Revisá el estado de las solicitudes de intercambio que enviaste." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitudes enviadas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Las propuestas que enviaste.</p>
        </div>
        <Link to="/solicitudes-recibidas" className="text-xs font-semibold text-brand-accent hover:underline shrink-0">Ver recibidas →</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS.map((e) => {
          const count = e.value === 'all' ? solicitudes.length : solicitudes.filter((s) => s.status === e.value).length
          if (e.value !== 'all' && count === 0) return null
          const activo = filtro === e.value
          return (
            <button key={e.value} onClick={() => setFiltro(e.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${activo ? 'bg-brand text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-brand/50 hover:text-brand'}`}>
              {e.label}
              {count > 0 && <span className={`ml-1.5 text-[10px] font-bold ${activo ? 'opacity-70' : 'text-slate-400'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-5 py-3">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm font-semibold text-brand-accent hover:underline">Reintentar</button>
        </div>
      ) : filtradas.length === 0 ? (
        <EmptyState filtro={filtro} />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div key={filtro} variants={listVariants} initial="hidden" animate="show" className="space-y-4">
            {filtradas.map((s) => <SolicitudEnviadaCard key={s._id ?? s.id} solicitud={s} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
