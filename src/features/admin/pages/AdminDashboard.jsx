import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Package, RefreshCw, AlertTriangle, Search, Filter, MoreVertical, Ban, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'
import SkeletonCard from '../../../shared/components/ui/SkeletonCard'
import { getAdminStats, getAdminPublications, updatePublicationStatus, deletePublication } from '../services/adminService'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [publications, setPublications] = useState([])
  const [loadingPubs, setLoadingPubs] = useState(true)

  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', pub: null })
  const [openDropdownId, setOpenDropdownId] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadPublications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  const loadStats = async () => {
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch {
      toast.error('Error al cargar métricas')
    } finally {
      setLoadingStats(false)
    }
  }

  const loadPublications = async () => {
    setLoadingPubs(true)
    try {
      // Backend filter by status if applied
      const params = filterStatus ? { status: filterStatus } : {}
      const data = await getAdminPublications(params)
      setPublications(data.publicaciones || [])
    } catch {
      toast.error('Error al cargar publicaciones')
    } finally {
      setLoadingPubs(false)
    }
  }

  const handleActionClick = (type, pub) => {
    setConfirmModal({ open: true, type, pub })
  }

  const confirmAction = async () => {
    const { type, pub } = confirmModal
    if (!pub) return

    try {
      if (type === 'suspend') {
        await updatePublicationStatus(pub._id, 'suspended')
        toast.success('Publicación suspendida exitosamente')
        // Update local state smoothly
        setPublications(prev => prev.map(p => p._id === pub._id ? { ...p, status: 'suspended' } : p))
      } else if (type === 'delete') {
        await deletePublication(pub._id)
        toast.success('Publicación eliminada exitosamente')
        // Remove from list for smooth animation
        setPublications(prev => prev.filter(p => p._id !== pub._id))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar la acción')
    } finally {
      setConfirmModal({ open: false, type: '', pub: null })
      loadStats() // Refresh stats
    }
  }

  const filteredPublications = publications.filter((pub) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const titleMatch = pub.title?.toLowerCase().includes(q)
    const authorName = `${pub.owner?.nombre || ''} ${pub.owner?.apellido || ''}`.toLowerCase()
    const authorMatch = authorName.includes(q)
    return titleMatch || authorMatch
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 mt-1">Gestión de métricas y moderación de contenido.</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Usuarios Activos"
          value={stats?.usuariosActivos}
          loading={loadingStats}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Publicaciones Activas"
          value={stats?.publicacionesActivas}
          loading={loadingStats}
          icon={<Package className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Intercambios en Curso"
          value={stats?.intercambiosActivos}
          loading={loadingStats}
          icon={<RefreshCw className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Reportes Pendientes"
          value={stats?.reportesPendientes}
          loading={loadingStats}
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-50"
        />
      </div>

      {/* Moderación */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Moderación de Publicaciones</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all w-full sm:w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="available">Activas</option>
              <option value="paused">Pausadas</option>
              <option value="suspended">Suspendidas</option>
            </select>
          </div>
        </div>

        <div className="p-0">
          {loadingPubs ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No se encontraron publicaciones.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              <AnimatePresence>
                {filteredPublications.map(pub => (
                  <motion.div
                    key={pub._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <img
                        src={pub.photos?.[0] || 'https://via.placeholder.com/150'}
                        alt={pub.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {pub.title}
                        </span>
                        <span className="text-xs text-slate-500 truncate mt-0.5">
                          {pub.owner?.nombre} {pub.owner?.apellido} • {new Date(pub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-4 relative">
                      <StatusBadge status={pub.status} />
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === pub._id ? null : pub._id)}
                        onBlur={() => setTimeout(() => setOpenDropdownId(null), 200)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg outline-none transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openDropdownId === pub._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-1 w-40 z-50"
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActionClick('suspend', pub); setOpenDropdownId(null); }}
                              disabled={pub.status === 'suspended'}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 outline-none rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Ban className="w-4 h-4" />
                              Suspender
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActionClick('delete', pub); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 outline-none rounded-lg cursor-pointer mt-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: '', pub: null })}
        onConfirm={confirmAction}
        title={confirmModal.type === 'suspend' ? 'Suspender Publicación' : 'Eliminar Publicación'}
        message={
          confirmModal.type === 'suspend'
            ? 'La publicación será ocultada del público y marcada como suspendida. ¿Deseas continuar?'
            : 'Esta acción borrará la publicación permanentemente y no se puede deshacer. ¿Estás seguro?'
        }
        variant={confirmModal.type === 'delete' ? 'danger' : 'default'}
        confirmText={confirmModal.type === 'suspend' ? 'Suspender' : 'Sí, eliminar'}
      />
    </motion.div>
  )
}

function StatCard({ title, value, loading, icon, bgColor }) {
  if (loading) {
    return <SkeletonCard className="h-28 rounded-2xl w-full" />
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value || 0}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    available: { text: 'Activa', classes: 'bg-green-100 text-green-700' },
    paused: { text: 'Pausada', classes: 'bg-slate-100 text-slate-700' },
    suspended: { text: 'Suspendida', classes: 'bg-amber-100 text-amber-700' },
    exchanged: { text: 'Intercambiada', classes: 'bg-blue-100 text-blue-700' },
  }
  const config = map[status] || { text: status, classes: 'bg-slate-100 text-slate-700' }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.classes}`}>
      {config.text}
    </span>
  )
}
