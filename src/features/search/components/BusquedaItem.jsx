import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Bell, BellOff, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PUBLICATION_CATEGORIES } from '../../../utils/constants'
import { toggleActiva, eliminar } from '../services/activeSearchService'

const TYPE_COLORS = {
  trueque: 'border-l-emerald-400 bg-emerald-50/50',
  venta: 'border-l-blue-400 bg-blue-50/50',
  ambos: 'border-l-purple-400 bg-purple-50/50',
}

const TYPE_BADGES = {
  trueque: 'bg-emerald-100 text-emerald-700',
  venta: 'bg-blue-100 text-blue-700',
  ambos: 'bg-purple-100 text-purple-700',
}

const TYPE_LABELS = {
  trueque: 'Trueque',
  venta: 'Venta',
  ambos: 'Ambos',
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 text-center mb-1">
          ¿Eliminar búsqueda?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BusquedaItem({ busqueda, onUpdate, onDelete }) {
  const navigate = useNavigate()
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const category = PUBLICATION_CATEGORIES.find(c => c.value === busqueda.category)
  const categoryLabel = category?.label || busqueda.category

  const handleToggle = async (e) => {
    e.stopPropagation()
    setToggling(true)
    try {
      await toggleActiva(busqueda._id, !busqueda.isActive)
      onUpdate()
      toast.success(busqueda.isActive ? 'Búsqueda desactivada' : 'Búsqueda activada')
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setToggling(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setShowConfirm(false)
    setDeleting(true)
    try {
      await eliminar(busqueda._id)
      onDelete()
      toast.success('Búsqueda eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div
        className={`border-l-4 rounded-lg border border-slate-100 p-4 transition-all hover:shadow-md ${
          TYPE_COLORS[busqueda.type]
        } ${!busqueda.isActive ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">{categoryLabel}</span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${TYPE_BADGES[busqueda.type]}`}>
                {TYPE_LABELS[busqueda.type]}
              </span>
              {!busqueda.isActive && (
                <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  Inactiva
                </span>
              )}
            </div>

            {busqueda.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {busqueda.keywords.slice(0, 5).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2.5 py-1 bg-white/70 border border-slate-200 rounded-full text-xs text-slate-600"
                  >
                    {keyword}
                  </span>
                ))}
                {busqueda.keywords.length > 5 && (
                  <span className="inline-block px-2.5 py-1 text-xs text-slate-500">
                    +{busqueda.keywords.length - 5} más
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-slate-400">
              Creada el {new Date(busqueda.createdAt).toLocaleDateString('es-AR')}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggle}
              disabled={toggling}
              title={busqueda.isActive ? 'Desactivar búsqueda' : 'Activar búsqueda'}
              className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                busqueda.isActive
                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {busqueda.isActive ? <Bell size={18} /> : <BellOff size={18} />}
            </button>

            <button
              onClick={() => navigate(`/search/crear?id=${busqueda._id}`)}
              title="Editar búsqueda"
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              <Edit2 size={18} />
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
              title="Eliminar búsqueda"
              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}