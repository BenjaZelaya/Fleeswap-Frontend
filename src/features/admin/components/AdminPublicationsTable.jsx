import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { Filter, MoreVertical, Ban, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { toast } from 'sonner'
import SkeletonCard from '../../../shared/components/ui/SkeletonCard'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'
import StatusBadge from './StatusBadge'
import { getAdminPublications, updatePublicationStatus, deletePublication } from '../services/adminService'

export default function AdminPublicationsTable() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [pagination, setPagination] = useState({ paginaActual: 1, totalPaginas: 1, totalPublicaciones: 0 })

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', pub: null })
  const [openDropdownId, setOpenDropdownId] = useState(null)

  useEffect(() => {
    loadPublications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, pagination.paginaActual])

  // Reset a la página 1 cuando se cambia el filtro
  useEffect(() => {
    setPagination(prev => ({ ...prev, paginaActual: 1 }))
  }, [filterStatus])

  const loadPublications = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.paginaActual,
        limit: 10
      }
      if (filterStatus) params.status = filterStatus

      const data = await getAdminPublications(params)
      setPublications(data.publicaciones || [])
      setPagination({
        paginaActual: data.pagina,
        totalPaginas: data.totalPaginas,
        totalPublicaciones: data.total
      })
    } catch {
      toast.error('Error al cargar publicaciones')
    } finally {
      setLoading(false)
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
        setPublications(prev => prev.map(p => p._id === pub._id ? { ...p, status: 'suspended' } : p))
      } else if (type === 'delete') {
        await deletePublication(pub._id)
        toast.success('Publicación eliminada exitosamente')
        setPublications(prev => prev.filter(p => p._id !== pub._id))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar la acción')
    } finally {
      setConfirmModal({ open: false, type: '', pub: null })
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

  const statusOptions = [
    {
      value: '',
      label: 'Todos los estados'
    },
    {
      value: 'available',
      label: 'Activas'
    },
    {
      value: 'unavailable',
      label: 'Pausadas'
    },
    {
      value: 'suspended',
      label: 'Suspendidas'
    }
  ]

  const customSelectStyles = {
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
    menu: (base) => ({ ...base, zIndex: 9999 })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm relative z-20">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Moderación de Publicaciones</h2>
        <div className="flex items-center gap-3 relative z-30">
          <div className="relative min-w-[220px] z-30">
            <Select
              options={statusOptions}
              value={statusOptions.find(o => o.value === filterStatus) || statusOptions[0]}
              onChange={(opt) => setFilterStatus(opt ? opt.value : '')}
              isSearchable={false}
              classNamePrefix="rs"
              styles={customSelectStyles}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-0 relative min-h-[400px]">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hay publicaciones</h3>
            <p className="text-slate-500 mt-2">No se encontraron resultados para el filtro actual.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            <AnimatePresence>
              {publications.map((pub, i) => (
                <motion.div
                  key={pub._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50 transition-all gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <Link to={`/publications/${pub._id}`} className="shrink-0 hover:opacity-80 transition-opacity block">
                      <img
                        src={pub.photos?.[0] || 'https://via.placeholder.com/150'}
                        alt={pub.title}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 group-hover:border-slate-300 transition-colors shadow-sm"
                      />
                    </Link>
                    <div className="flex flex-col min-w-0">
                      <Link to={`/publications/${pub._id}`} className="hover:underline focus:outline-none">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {pub.title}
                        </span>
                      </Link>
                      <span className="text-xs font-medium text-slate-500 truncate mt-1">
                        {pub.owner?.nombre} {pub.owner?.apellido} • {new Date(pub.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 shrink-0">
                    <StatusBadge status={pub.status} />
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === pub._id ? null : pub._id)}
                        onBlur={() => setTimeout(() => setOpenDropdownId(null), 200)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg outline-none transition-all shadow-sm border border-transparent hover:border-slate-200"
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
                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 w-44 z-50 origin-top-right"
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActionClick('suspend', pub); setOpenDropdownId(null); }}
                              disabled={pub.status === 'suspended'}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              Suspender
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleActionClick('delete', pub); setOpenDropdownId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg outline-none cursor-pointer mt-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && publications.length > 0 && pagination.totalPaginas > 1 && (
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

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: '', pub: null })}
        onConfirm={confirmAction}
        title={confirmModal.type === 'suspend' ? 'Suspender Publicación' : 'Eliminar Publicación'}
        message={
          confirmModal.type === 'suspend'
            ? 'La publicación será ocultada del público y marcada como suspendida. ¿Querés continuar?'
            : 'Esta acción borrará la publicación permanentemente y no se puede deshacer. ¿Estás seguro?'
        }
        variant={confirmModal.type === 'delete' ? 'danger' : 'default'}
        confirmText={confirmModal.type === 'suspend' ? 'Suspender' : 'Sí, eliminar'}
      />
    </div>
  )
}
