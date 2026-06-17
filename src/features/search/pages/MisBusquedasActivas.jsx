import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import BusquedaItem from '../components/BusquedaItem'
import { getMisBusquedas } from '../services/activeSearchService'
import PageSpinner from '../../../shared/components/ui/PageSpinner'

export default function MisBusquedasActivas() {
  const navigate = useNavigate()
  const [busquedas, setBusquedas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarBusquedas = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMisBusquedas()
      setBusquedas(data)
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al cargar las búsquedas'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarBusquedas()
  }, [])

  const handleDeleteSuccess = () => {
    cargarBusquedas()
  }

  if (loading) {
    return <PageSpinner label="Cargando búsquedas..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Mis Búsquedas Activas</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {busquedas.length === 0
                ? 'Crea una búsqueda para recibir alertas'
                : `Tienes ${busquedas.length} búsqueda${busquedas.length > 1 ? 's' : ''} activa${busquedas.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/search/crear')}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-light transition-all font-medium text-sm"
          >
            <Plus size={18} />
            Nueva búsqueda
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={cargarBusquedas}
              className="mt-3 text-sm text-red-600 font-medium hover:text-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {busquedas.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Sin búsquedas activas
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Crea tu primera búsqueda para empezar a recibir alertas
            </p>
            <button
              onClick={() => navigate('/search/crear')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-light transition-all font-medium"
            >
              <Plus size={18} />
              Crear búsqueda
            </button>
          </div>
        )}

        {/* Lista de búsquedas */}
        {busquedas.length > 0 && (
          <div className="space-y-3">
            {busquedas.map(busqueda => (
              <BusquedaItem
                key={busqueda._id}
                busqueda={busqueda}
                onUpdate={cargarBusquedas}
                onDelete={handleDeleteSuccess}
              />
            ))}
          </div>
        )}

        {/* Info card */}
        {busquedas.length > 0 && (
          <div className="mt-6 rounded-xl border border-brand/15 bg-brand/5 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-brand-accent">Tip:</span> Desactivá una búsqueda si no querés recibir alertas temporalmente,
              sin perder tus criterios.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
