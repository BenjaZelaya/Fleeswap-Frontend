import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getSolicitudesEnviadas } from '../services/solicitudService'
import Seo from '../../../shared/components/Seo'
import { logError } from '../../../utils/logger'

// ─── Constantes ─────────────────────────────────────────────────────────────

const ESTADOS = [
  { value: 'all',      label: 'Todas' },
  { value: 'pending',  label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
]

const BADGE = {
  pending:  'bg-amber-100 text-amber-800 border border-amber-200',
  accepted: 'bg-green-100 text-green-800 border border-green-200',
  rejected: 'bg-red-100   text-red-700   border border-red-200',
}
const BADGE_LABEL = {
  pending:  'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}
const CARD_ACCENT = {
  pending:  'border-l-4 border-l-amber-400',
  accepted: 'border-l-4 border-l-green-400',
  rejected: 'border-l-4 border-l-red-300',
}

// ─── Animaciones ────────────────────────────────────────────────────────────

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
  exit:   { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function ProductMini({ photo, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 aspect-square">
        {photo ? (
          <img
            src={photo}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
        {title ?? <span className="text-slate-400 font-normal italic">Sin título</span>}
      </p>
    </div>
  )
}

/**
 * Card desde la perspectiva del EMISOR de la solicitud.
 *   - "receptor" = dueño del objeto que quiero
 *   - publicacionOferta = lo que yo ofrezco
 *   - publicacionDestino = lo que quiero (el del receptor)
 */
function SolicitudEnviadaCard({ solicitud }) {
  const { receptor, publicacionOferta, publicacionDestino, estado, monto, createdAt } = solicitud

  const receptorInitial = receptor?.nombre?.[0]?.toUpperCase() ?? '?'
  const receptorName    = [receptor?.nombre, receptor?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const fecha           = createdAt
    ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''

  const accentClass = CARD_ACCENT[estado] ?? 'border-l-4 border-l-slate-200'

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.10)' }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${accentClass}`}
    >
      {/* Header — receptor + fecha + estado */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/40">
        <Link
          to={`/profile/${receptor?._id ?? receptor?.id}`}
          className="flex items-center gap-2.5 group min-w-0"
        >
          {receptor?.photo ? (
            <img
              src={receptor.photo}
              alt={receptorName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-white shadow-sm">
              {receptorInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-accent transition-colors truncate">
              {receptorName}
            </p>
            <p className="text-[10px] text-slate-400 font-light">tu solicitud está en espera</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {fecha && <span className="hidden sm:block text-[10px] font-light text-slate-400">{fecha}</span>}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${BADGE[estado] ?? 'bg-slate-100 text-slate-500'}`}>
            {BADGE_LABEL[estado] ?? estado}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
        {/* Lo que ofreciste */}
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block" />
            Lo que ofreciste
          </p>
          <ProductMini
            photo={publicacionOferta?.photos?.[0] ?? publicacionOferta?.photo}
            title={publicacionOferta?.title ?? publicacionOferta?.titulo}
          />
          {monto > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              + ${monto.toLocaleString('es-AR')} complementario
            </span>
          )}
        </div>

        {/* Lo que querés */}
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
            Lo que querés
          </p>
          <ProductMini
            photo={publicacionDestino?.photos?.[0] ?? publicacionDestino?.photo}
            title={publicacionDestino?.title ?? publicacionDestino?.titulo}
          />
          {(publicacionDestino?._id ?? publicacionDestino?.id) && (
            <Link
              to={`/publications/${publicacionDestino?._id ?? publicacionDestino?.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-accent hover:underline"
            >
              Ver publicación →
            </Link>
          )}
        </div>
      </div>

      {/* Footer — fecha en mobile */}
      {fecha && (
        <div className="sm:hidden px-5 py-2.5 border-t border-slate-50 bg-slate-50/40">
          <span className="text-[10px] font-light text-slate-400">{fecha}</span>
        </div>
      )}
    </motion.div>
  )
}

function EmptyState({ filtro }) {
  const mensaje = filtro === 'all'
    ? 'Aún no enviaste solicitudes de intercambio.'
    : `No tenés solicitudes ${BADGE_LABEL[filtro]?.toLowerCase() ?? filtro}s.`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold text-base">{mensaje}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        Explorá publicaciones y enviá tu primera propuesta de intercambio.
      </p>
      <Link
        to="/explore"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand hover:bg-brand-light transition-colors px-5 py-2.5 rounded-xl"
      >
        Explorar publicaciones
      </Link>
    </motion.div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function SolicitudesEnviadas() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [filtro, setFiltro]           = useState('all')

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true); setError(null)
      try {
        const data = await getSolicitudesEnviadas()
        if (!cancelled) setSolicitudes(Array.isArray(data) ? data : data?.solicitudes ?? [])
      } catch (err) {
        logError('Error fetching solicitudes enviadas:', err)
        if (!cancelled) setError('No se pudieron cargar tus solicitudes. Intentá de nuevo.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const listadoFiltrado = filtro === 'all'
    ? solicitudes
    : solicitudes.filter((s) => s.estado === filtro)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Seo
        title="Mis solicitudes enviadas · Fleeswap"
        description="Revisá el estado de las solicitudes de intercambio que enviaste."
      />

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitudes enviadas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Las propuestas de intercambio que enviaste.</p>
        </div>
        <Link
          to="/solicitudes-recibidas"
          className="shrink-0 text-xs font-semibold text-brand-accent hover:underline"
        >
          Ver recibidas →
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS.map((e) => {
          const activo = filtro === e.value
          const count  = e.value === 'all'
            ? solicitudes.length
            : solicitudes.filter((s) => s.estado === e.value).length
          return (
            <button
              key={e.value}
              onClick={() => setFiltro(e.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activo
                  ? 'bg-brand text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-brand/50 hover:text-brand'
              }`}
            >
              {e.label}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold ${activo ? 'opacity-70' : 'text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 text-center gap-4">
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-5 py-3">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm font-semibold text-brand-accent hover:underline">
            Reintentar
          </button>
        </div>
      ) : listadoFiltrado.length === 0 ? (
        <EmptyState filtro={filtro} />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div key={filtro} variants={listVariants} initial="hidden" animate="show" className="space-y-4">
            {listadoFiltrado.map((s) => (
              <SolicitudEnviadaCard key={s._id ?? s.id} solicitud={s} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
