import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getSolicitudesRecibidas } from '../services/solicitudService'
import Seo from '../../../shared/components/Seo'
import { logError } from '../../../utils/logger'
import { ESTADOS, listVariants } from '../utils/constants'
import EmptyState from '../components/EmptyState'
import SolicitudRecibidaCard from '../components/SolicitudRecibidaCard'

export default function SolicitudRecibidas() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('all')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const data = await getSolicitudesRecibidas()
        if (!cancelled) setSolicitudes(Array.isArray(data) ? data : (data?.exchanges ?? []))
      } catch (err) {
        logError('getSolicitudesRecibidas:', err)
        if (!cancelled) setError('No se pudieron cargar las solicitudes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshCount])

  const filtradas = filtro === 'all' ? solicitudes : solicitudes.filter((s) => s.status === filtro)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Seo title="Solicitudes de intercambio · Fleeswap" description="Gestioná las solicitudes de intercambio que recibiste." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitudes recibidas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Decidí sobre las propuestas que te enviaron.</p>
        </div>
        <Link to="/solicitudes-enviadas" className="text-xs font-semibold text-brand-accent hover:underline shrink-0">Ver enviadas →</Link>
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
            {filtradas.map((s) => <SolicitudRecibidaCard key={s._id ?? s.id} solicitud={s} onUpdateSuccess={() => setRefreshCount(c => c + 1)} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
