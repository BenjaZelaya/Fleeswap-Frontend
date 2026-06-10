import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import BusquedaForm from '../components/BusquedaForm'
import { crear, editar, getMisBusquedas } from '../services/activeSearchService'

export default function CrearBusquedaActiva() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(editId ? true : false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editId) {
      getMisBusquedas()
        .then(busquedas => {
          // El servicio ya devuelve un arreglo normalizado aunque el backend
          // cambie el envelope de respuesta.
          const busqueda = busquedas.find(b => b._id === editId)
          if (busqueda) {
            setInitialData(busqueda)
          } else {
            setError('Búsqueda no encontrada')
          }
        })
        .catch(() => setError('No se pudo cargar la búsqueda'))
        .finally(() => setLoading(false))
    }
  }, [editId])

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setError(null)
    try {
      if (editId) {
        await editar(editId, payload)
        toast.success('Búsqueda actualizada')
      } else {
        await crear(payload)
        toast.success('Búsqueda creada')
      }
      navigate('/search/mis-busquedas')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message

      // Diferenciar estos casos ayuda a no leer como "500" lo que en realidad
      // puede ser conflicto de negocio o validacion.
      if (status === 409 || msg?.includes('duplicado') || msg?.includes('igual')) {
        toast.error('Ya existe una búsqueda con estos criterios')
        setError('Ya existe una búsqueda con estos criterios')
      } else if (status === 500 || !msg) {
        toast.error('Hubo un problema al guardar. Intentá de nuevo.')
        setError(null)
      } else {
        toast.error(msg)
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand" />
        </div>
      </div>
    )
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {editId ? 'Editar búsqueda' : 'Crear búsqueda activa'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {editId
                ? 'Actualiza tus criterios de búsqueda'
                : 'Definí qué objeto estás buscando para recibir alertas'}
            </p>
          </div>
        </div>

        {/* Card de formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
          <BusquedaForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={submitting}
            serverError={error}
          />
        </div>

        {/* Hint */}
        <div className="mt-6 rounded-xl border border-brand/15 bg-brand/5 p-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-brand-accent">Tip:</span> Podés crear múltiples búsquedas con diferentes criterios.
            Cuando alguien publique algo que coincida, vas a recibir una notificación.
          </p>
        </div>
      </div>
    </div>
  )
}
