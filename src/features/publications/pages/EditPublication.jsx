import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'
import {
  getPublicationById,
  updatePublication,
} from '../services/publicationService'
import {
  validateTitle,
  validateDescription,
  validateHistory,
  validateCategory,
  validateCondition,
  validatePublicationType,
  validatePrice,
  validateLocationPublication,
} from '../../../utils/validators'
import {
  PUBLICATION_CATEGORIES,
  PUBLICATION_CONDITIONS,
  PUBLICATION_TYPES,
} from '../../../utils/constants'
import SelectField from '../../../shared/components/SelectField'
import RadioGroup from '../../../shared/components/RadioGroup'
import PhotoManager from '../components/PhotoManager'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { toast } from 'sonner'

export default function EditPublication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()

  // Estados
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [originalPub, setOriginalPub] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    history: '',
    category: '',
    condition: '',
    type: 'venta',
    price: '',
    location: '',
    photos: [],
  })
  const [errors, setErrors] = useState({})

  // Cargar publicación
  useEffect(() => {
    fetchPublication()
  }, [id])

  const fetchPublication = async () => {
    try {
      setLoading(true)
      const pub = await getPublicationById(id)

      // Verificar propietario
      if (String(authUser?.id) !== String(pub.owner?._id || pub.owner)) {
        toast.error('No tienes permiso para editar esta publicación')
        navigate(`/profile/${pub.owner?._id || pub.owner}`)
        return
      }

      setOriginalPub(pub)
      setForm({
        title: pub.title || '',
        description: pub.description || '',
        history: pub.history || '',
        category: pub.category || '',
        condition: pub.condition || '',
        type: pub.type || 'venta',
        price: pub.price ? String(pub.price) : '',
        location: pub.location || '',
        photos: pub.photos || [],
      })
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar publicación'
      console.error('Error al cargar publicación:', err)
      toast.error(message)
      navigate('/my-publications')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddPhoto = (url) => {
    if (form.photos.length < 5) {
      setForm((prev) => ({
        ...prev,
        photos: [...prev.photos, url],
      }))
      if (errors.photos) {
        setErrors((prev) => ({ ...prev, photos: '' }))
      }
    }
  }

  const handleRemovePhoto = (idx) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    const titleError = validateTitle(form.title)
    if (titleError) newErrors.title = titleError

    const descError = validateDescription(form.description)
    if (descError) newErrors.description = descError

    const histError = validateHistory(form.history)
    if (histError) newErrors.history = histError

    const catError = validateCategory(form.category)
    if (catError) newErrors.category = catError

    const condError = validateCondition(form.condition)
    if (condError) newErrors.condition = condError

    const typeError = validatePublicationType(form.type)
    if (typeError) newErrors.type = typeError

    const priceError = validatePrice(form.price, form.type)
    if (priceError) newErrors.price = priceError

    const locError = validateLocationPublication(form.location)
    if (locError) newErrors.location = locError

    if (form.photos.length === 0) {
      newErrors.photos = 'Debe haber al menos 1 foto'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateChanges = () => {
    const changes = {}

    // Comparar cada campo de forma simple y segura
    if ((form.title || '').trim() !== (originalPub?.title || '').trim()) {
      changes.title = (form.title || '').trim()
    }
    
    if ((form.description || '').trim() !== (originalPub?.description || '').trim()) {
      changes.description = (form.description || '').trim()
    }
    
    if ((form.history || '').trim() !== (originalPub?.history || '').trim()) {
      changes.history = (form.history || '').trim()
    }
    
    if ((form.category || '') !== (originalPub?.category || '')) {
      changes.category = form.category || ''
    }
    
    if ((form.condition || '') !== (originalPub?.condition || '')) {
      changes.condition = form.condition || ''
    }
    
    if ((form.type || '') !== (originalPub?.type || '')) {
      changes.type = form.type || ''
    }
    
    // Precio especial: solo si no es trueque puro
    if ((form.type || '') !== 'trueque') {
      const formPrice = (form.price || '').trim()
      const newPrice = formPrice ? parseInt(formPrice, 10) : null
      const originalPrice = originalPub?.price || null
      
      if (newPrice !== originalPrice) {
        changes.price = newPrice
      }
    }
    
    if ((form.location || '').trim() !== (originalPub?.location || '').trim()) {
      changes.location = (form.location || '').trim()
    }
    
    if (JSON.stringify(form.photos || []) !== JSON.stringify(originalPub?.photos || [])) {
      changes.photos = form.photos || []
    }

    return changes
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)
      
      // Preparar datos para enviar
      const dataToSend = {
        title: form.title.trim(),
        description: form.description.trim(),
        history: form.history.trim(),
        category: form.category,
        condition: form.condition,
        type: form.type,
        location: form.location.trim(),
        photos: form.photos,
      }
      
      // Agregar precio solo si no es trueque puro
      if (form.type !== 'trueque') {
        const priceNum = form.price ? parseInt(form.price, 10) : null
        if (priceNum && priceNum > 0) {
          dataToSend.price = priceNum
        }
      }
      
      console.log('Datos a enviar:', dataToSend)
      const response = await updatePublication(id, dataToSend)
      console.log('Respuesta del servidor:', response)
      
      toast.success('¡Publicación editada exitosamente!')
      setTimeout(() => {
        navigate('/my-publications')
      }, 500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar publicación'
      console.error('Error al actualizar:', {
        status: err.response?.status,
        message: errorMsg,
        data: err.response?.data
      })
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const hasChanges = Object.keys(calculateChanges()).length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F7F4] to-slate-50 flex items-center justify-center">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F4] to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Publicación</h1>
          <p className="text-gray-600 mt-2">Actualiza los detalles de tu publicación</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold">
                1
              </span>
              Información Básica
            </h2>

            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ej: PlayStation 5 Como Nueva"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    errors.title
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Precio <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    errors.price
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>

              {/* Categoría */}
              <SelectField
                label="Categoría"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={PUBLICATION_CATEGORIES}
                error={errors.category}
                required
              />

              {/* Condición */}
              <SelectField
                label="Condición"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                options={PUBLICATION_CONDITIONS}
                error={errors.condition}
                required
              />

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ej: Palermo, CABA"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    errors.location
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESCRIPCIÓN */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold">
                2
              </span>
              Descripción
            </h2>

            <div className="space-y-4">
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe el producto..."
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${
                    errors.description
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Historial */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Historial del Objeto <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="history"
                  value={form.history}
                  onChange={handleChange}
                  placeholder="Cuéntanos la historia del objeto..."
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${
                    errors.history
                      ? 'border-red-500 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-brand'
                  } focus:outline-none focus:ring-2`}
                />
                {errors.history && <p className="text-xs text-red-500 mt-1">{errors.history}</p>}
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: TIPO */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold">
                3
              </span>
              Tipo de Publicación
            </h2>

            <RadioGroup
              label=""
              name="type"
              value={form.type}
              onChange={handleChange}
              options={PUBLICATION_TYPES}
              error={errors.type}
            />
          </div>

          {/* SECCIÓN 4: FOTOS */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand text-sm font-bold">
                4
              </span>
              Fotos
            </h2>

            <PhotoManager
              photos={form.photos}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              error={errors.photos}
              maxPhotos={5}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-publications')}
              className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton
              loading={submitting}
              label="Guardar Cambios"
              loadingLabel="Guardando..."
              disabled={!hasChanges}
              className="flex-1"
            />
          </div>

          {/* Info de cambios */}
          {!hasChanges && (
            <p className="text-sm text-gray-500 text-center">
              Realiza cambios para habilitar el botón guardar
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
