import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getSolicitudesRecibidas, getSolicitudesEnviadas } from '../services/solicitudService'
import UnifiedExchangeCard from '../components/UnifiedExchangeCard'
import RatingModal from '../../ratings/components/RatingModal'
import Seo from '../../../shared/components/Seo'

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'recibidas', label: 'Solicitudes Recibidas' },
  { key: 'enviadas', label: 'Solicitudes Enviadas' },
  { key: 'completados', label: 'Completados' },
]

// ─── Empty state ──────────────────────────────────────────────────────────────
const EMPTY_MESSAGES = {
  recibidas:   'No tenés solicitudes recibidas en curso',
  enviadas:    'No enviaste ninguna solicitud',
  completados: 'Aún no tenés intercambios completados',
}

function EmptyState({ tab }) {
  const isEnviadas = tab === 'enviadas'
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
      <p className="text-base font-bold text-slate-700 mb-1">{EMPTY_MESSAGES[tab]}</p>
      {isEnviadas && (
        <>
          <p className="text-sm text-slate-400 mb-6 max-w-xs">
            Explorá publicaciones disponibles y propone tu primer trueque.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar publicaciones
          </Link>
        </>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50">
        <div className="h-4 w-28 bg-slate-100 rounded-full" />
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className="h-3 w-14 bg-slate-100 rounded" />
          <div className="w-16 h-16 rounded-xl bg-slate-100" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100" />
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="w-16 h-16 rounded-xl bg-slate-100" />
          <div className="h-3 w-16 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="px-5 py-2.5 border-t border-slate-50">
        <div className="h-4 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MisIntercambios() {
  const [intercambios, setIntercambios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabActivo, setTabActivo] = useState('recibidas')

  // Rating modal
  const [ratingData, setRatingData] = useState(null) // { exchangeId, otherUserName, itemName }

  useEffect(() => {
    let active = true
    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        const [rec, env] = await Promise.all([
          getSolicitudesRecibidas(),
          getSolicitudesEnviadas()
        ])
        
        if (!active) return

        const normalize = (data) => Array.isArray(data) ? data : (data?.exchanges ?? [])
        const recibidas = normalize(rec).map(x => ({ ...x, source: 'received' }))
        const enviadas = normalize(env).map(x => ({ ...x, source: 'sent' }))

        const all = [...recibidas, ...enviadas].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt)
        })

        setIntercambios(all)
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Error al cargar los intercambios')
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchAll()
    return () => { active = false }
  }, [])

  // ─── Filtrado ──────────────────────────────────────────────────────────────
  const lists = useMemo(() => {
    const listRecibidas = []
    const listEnviadas = []
    const listCompletados = []

    intercambios.forEach(exchange => {
      // Si está completado, va a la tab de Completados (sin importar si es env o rec)
      if (exchange.status === 'completed') {
        listCompletados.push(exchange)
        return
      }

      // Omitimos rechazados y cancelados en la vista simplificada para que no molesten
      // (a menos que el usuario lo requiera, los mantenemos ocultos en esta UI limpia)
      if (['rejected', 'cancelled'].includes(exchange.status)) return

      // Pendientes y Activos
      if (exchange.source === 'received') {
        listRecibidas.push(exchange)
      } else {
        listEnviadas.push(exchange)
      }
    })

    return { recibidas: listRecibidas, enviadas: listEnviadas, completados: listCompletados }
  }, [intercambios])

  const filtrados = lists[tabActivo] || []

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleCalificar(exchange) {
    const amIRequester = exchange.source === 'sent'
    const otherUser = amIRequester ? exchange.owner : exchange.requester
    const userName = otherUser?.nombre 
      ? `${otherUser.nombre} ${otherUser.apellido || ''}`.trim() 
      : 'Usuario'
    
    // Obtenemos un producto para mostrar en el modal (puede ser el que compró o intercambió)
    const product = exchange.type === 'purchase' 
      ? exchange.requestedPublication 
      : (amIRequester ? exchange.requestedPublication : exchange.offeredPublication)
      
    const itemName = product?.title ?? product?.titulo ?? 'Artículo'

    setRatingData({
      exchangeId: exchange._id || exchange.id,
      otherUserName: userName,
      itemName,
    })
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Seo title="Mis intercambios - Fleeswap" description="Panel unificado de tus solicitudes e intercambios en Fleeswap." />

      <div className="max-w-3xl mx-auto px-4 py-8 pb-28">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Panel de Intercambios</h1>
          <p className="text-sm text-slate-400 mt-0.5">Tus solicitudes, compras y trueques en un solo lugar</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none border-b border-slate-100">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTabActivo(tab.key)}
              className={`shrink-0 relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                tabActivo === tab.key
                  ? 'text-brand border-b-2 border-brand'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {lists[tab.key]?.length > 0 && (
                <span className={`ml-2 inline-flex items-center justify-center px-1.5 h-4 rounded-full text-[10px] font-black ${
                  tabActivo === tab.key ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-500'
                }`}>
                  {lists[tab.key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <CardSkeleton key={n} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 bg-red-50/50 rounded-2xl border border-red-100">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-brand-accent hover:text-brand transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tabActivo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filtrados.length === 0 ? (
                <EmptyState tab={tabActivo} />
              ) : (
                <div className="space-y-5">
                  {filtrados.map(intercambio => (
                    <UnifiedExchangeCard
                      key={intercambio._id || intercambio.id}
                      exchange={intercambio}
                      onCalificar={handleCalificar}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Rating Modal */}
      {ratingData && (
        <RatingModal
          isOpen={!!ratingData}
          onClose={() => setRatingData(null)}
          exchangeId={ratingData.exchangeId}
          otherUserName={ratingData.otherUserName}
          itemName={ratingData.itemName}
          onSuccess={() => {
            // Actualizamos localmente si es necesario, o recargamos
            window.location.reload()
          }}
        />
      )}
    </>
  )
}
