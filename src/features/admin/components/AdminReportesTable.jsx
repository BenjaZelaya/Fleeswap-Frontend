import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { toast } from 'sonner'
import { Flag, ChevronLeft, ChevronRight, ShieldAlert, X, ExternalLink, User } from 'lucide-react'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'
import SkeletonCard from '../../../shared/components/ui/SkeletonCard'
import { getAdminReportes, resolverReporte } from '../services/adminService'

// ── Helper: tiempo relativo sin date-fns ──────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hs = Math.floor(mins / 60)
  if (hs < 24) return `hace ${hs} h`
  const days = Math.floor(hs / 24)
  if (days < 30) return `hace ${days} día${days !== 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months !== 1 ? 'es' : ''}`
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const REASON_LABELS = {
  spam: 'Spam o publicidad no deseada',
  contenido_inapropiado: 'Contenido inapropiado',
  objeto_falso: 'El objeto no existe o es falso',
  descripcion_enganosa: 'Descripción engañosa',
  precio_abusivo: 'Precio abusivo',
  otro: 'Otro',
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  reviewed: {
    label: 'Resuelto',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  dismissed: {
    label: 'Descartado',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

// ── Select Styles (mismo estilo que el resto del admin) ───────────────────────
const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? 'var(--color-brand, #1e3a5f)' : '#d1d5db',
    boxShadow: 'none',
    fontSize: '0.875rem',
    '&:hover': { borderColor: '#9ca3af' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected
      ? 'var(--color-brand, #1e3a5f)'
      : state.isFocused
        ? '#e0e7ff'
        : 'white',
    color: state.isSelected ? 'white' : state.isFocused ? 'var(--color-brand, #1e3a5f)' : '#1e293b',
  }),
  menuList: (base) => ({ ...base, maxHeight: '220px' }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function ReporteRow({ reporte, onSuspend, onDismiss }) {
  const pub = reporte.publicationId
  const reporter = reporte.reporterId
  const isPending = reporte.status === 'pending'
  const relativeTime = timeAgo(reporte.createdAt)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col lg:flex-row lg:items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${isPending ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent'}`}
    >
      {/* Motivo + fecha */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-sm font-bold ${isPending ? 'text-rose-700' : 'text-slate-700'}`}>
            {REASON_LABELS[reporte.reason] || reporte.reason}
          </span>
          <StatusBadge status={reporte.status} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{relativeTime}</p>
        {reporte.details && (
          <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
            "{reporte.details}"
          </p>
        )}
      </div>

      {/* Publicación denunciada */}
      <div className="flex items-center gap-3 lg:w-56 shrink-0">
        {pub ? (
          <>
            <img
              src={pub.photos?.[0] || 'https://placehold.co/56x56?text=?'}
              alt={pub.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{pub.title}</p>
              <Link
                to={`/publications/${pub._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline mt-0.5"
              >
                Ver publicación <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-400 italic">Publicación eliminada</span>
        )}
      </div>

      {/* Denunciante */}
      <div className="flex items-center gap-2 lg:w-36 shrink-0">
        {reporter ? (
          <>
            {reporter.photo ? (
              <img src={reporter.photo} alt={reporter.nombre} className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            )}
            <Link to={`/profile/${reporter._id}`} className="text-xs font-medium text-slate-700 hover:underline truncate">
              {reporter.nombre} {reporter.apellido}
            </Link>
          </>
        ) : (
          <span className="text-xs text-slate-400 italic">Usuario desconocido</span>
        )}
      </div>

      {/* Acciones — solo si está pendiente */}
      <div className="flex items-center gap-2 shrink-0">
        {isPending ? (
          <>
            <button
              onClick={() => onSuspend(reporte)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Suspender
            </button>
            <button
              onClick={() => onDismiss(reporte)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              Descartar
            </button>
          </>
        ) : (
          <span className="text-xs text-slate-400 italic">Resuelto</span>
        )}
      </div>
    </motion.div>
  )
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function AdminReportesTable() {
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ paginaActual: 1, totalPaginas: 1, total: 0 })

  // Por defecto: mostrar los pendientes primero (más urgente)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [filterReason, setFilterReason] = useState('')

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', reporte: null })
  const [resolving, setResolving] = useState(false)

  // ── Cargar reportes ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadReportes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterReason, pagination.paginaActual])

  // Reset página cuando cambia un filtro
  useEffect(() => {
    setPagination(prev => ({ ...prev, paginaActual: 1 }))
  }, [filterStatus, filterReason])

  const loadReportes = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: pagination.paginaActual, limit: 10 }
      if (filterStatus) params.status = filterStatus
      if (filterReason) params.reason = filterReason

      const data = await getAdminReportes(params)
      setReportes(data.reportes || [])
      setPagination({
        paginaActual: data.pagina,
        totalPaginas: data.totalPaginas,
        total: data.total,
      })
    } catch {
      setError('Error al cargar los reportes. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ── Abrir modales ────────────────────────────────────────────────────────────
  const handleSuspend = (reporte) => setConfirmModal({ open: true, type: 'suspend', reporte })
  const handleDismiss = (reporte) => setConfirmModal({ open: true, type: 'dismiss', reporte })
  const closeModal = () => setConfirmModal({ open: false, type: '', reporte: null })

  // ── Confirmar acción ─────────────────────────────────────────────────────────
  const confirmAction = async () => {
    const { type, reporte } = confirmModal
    if (!reporte) return

    setResolving(true)
    try {
      const action = type === 'suspend' ? 'suspend_publication' : 'dismiss'
      const updated = await resolverReporte(reporte._id, action)

      toast.success(
        type === 'suspend'
          ? 'Publicación suspendida. El reporte fue marcado como resuelto.'
          : 'Reporte descartado exitosamente.'
      )

      // Actualización optimista: reemplazar el reporte en la lista local
      setReportes(prev =>
        prev.map(r => r._id === reporte._id ? { ...r, status: updated.status } : r)
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al procesar el reporte.')
    } finally {
      setResolving(false)
      closeModal()
    }
  }

  const handlePrevPage = () => {
    if (pagination.paginaActual > 1) {
      setPagination(prev => ({ ...prev, paginaActual: prev.paginaActual - 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (pagination.paginaActual < pagination.totalPaginas) {
      setPagination(prev => ({ ...prev, paginaActual: prev.paginaActual + 1 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // ── Opciones de filtro ───────────────────────────────────────────────────────
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'reviewed', label: 'Resueltos' },
    { value: 'dismissed', label: 'Descartados' },
  ]

  const reasonOptions = [
    { value: '', label: 'Todos los motivos' },
    { value: 'spam', label: 'Spam o publicidad' },
    { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
    { value: 'objeto_falso', label: 'Objeto falso' },
    { value: 'descripcion_enganosa', label: 'Descripción engañosa' },
    { value: 'precio_abusivo', label: 'Precio abusivo' },
    { value: 'otro', label: 'Otro' },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">

      {/* Header + Filtros */}
      <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Moderación de Reportes</h2>
            {!loading && (
              <p className="text-sm text-slate-500 mt-0.5">
                {pagination.total} reporte{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {/* Badge alerta si hay pendientes */}
          {filterStatus === 'pending' && pagination.total > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <Flag className="w-3.5 h-3.5" />
              {pagination.total} pendiente{pagination.total !== 1 ? 's' : ''} de revisión
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-30">
          <div className="relative z-30">
            <Select
              options={statusOptions}
              value={statusOptions.find(o => o.value === filterStatus) || statusOptions[0]}
              onChange={(opt) => setFilterStatus(opt ? opt.value : '')}
              isSearchable={false}
              classNamePrefix="rs"
              styles={SELECT_STYLES}
            />
          </div>
          <div className="relative z-20">
            <Select
              options={reasonOptions}
              value={reasonOptions.find(o => o.value === filterReason) || reasonOptions[0]}
              onChange={(opt) => setFilterReason(opt ? opt.value : '')}
              isSearchable={false}
              classNamePrefix="rs"
              styles={SELECT_STYLES}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="m-6 bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          {error}
          <button onClick={loadReportes} className="ml-auto font-bold hover:underline text-xs">Reintentar</button>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 relative min-h-[400px]">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : reportes.length === 0 && !error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
              <Flag className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sin reportes</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-xs">
              {filterStatus === 'pending'
                ? '¡Excelente! No hay denuncias pendientes de revisión.'
                : 'No se encontraron reportes con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {reportes.map((reporte) => (
              <ReporteRow
                key={reporte._id}
                reporte={reporte}
                onSuspend={handleSuspend}
                onDismiss={handleDismiss}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Paginación */}
      {!loading && reportes.length > 0 && pagination.totalPaginas > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 mt-auto">
          <button
            onClick={handlePrevPage}
            disabled={pagination.paginaActual === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-sm font-semibold text-slate-500">
            {pagination.paginaActual} de {pagination.totalPaginas}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pagination.paginaActual === pagination.totalPaginas}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Modal: Suspender Publicación ── */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === 'suspend'}
        onClose={closeModal}
        onConfirm={confirmAction}
        loading={resolving}
        title="Suspender publicación"
        message="¿Estás seguro de que querés suspender esta publicación? El contenido dejará de ser visible y el reporte quedará marcado como resuelto."
        confirmLabel="Sí, suspender"
        cancelLabel="Cancelar"
        variant="danger"
      />

      {/* ── Modal: Descartar Reporte ── */}
      <ConfirmModal
        open={confirmModal.open && confirmModal.type === 'dismiss'}
        onClose={closeModal}
        onConfirm={confirmAction}
        loading={resolving}
        title="Descartar reporte"
        message="¿Querés descartar este reporte? La publicación seguirá activa y sin restricciones."
        confirmLabel="Sí, descartar"
        cancelLabel="Cancelar"
        variant="default"
      />
    </div>
  )
}
