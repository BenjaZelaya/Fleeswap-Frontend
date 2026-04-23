import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  validateTitle,
  validateDescription,
  validateHistory,
  validateCategory,
  validateCondition,
  validatePublicationType,
  validatePhotos,
  validatePrice,
  validateLocationPublication,
} from '../../../utils/validators'
import {
  PUBLICATION_CATEGORIES,
  PUBLICATION_CONDITIONS,
  PUBLICATION_TYPES,
} from '../../../utils/constants'
import { createPublication } from '../services/publicationService'
import ImageUpload from '../../../shared/components/ImageUpload'
import SelectField from '../../../shared/components/SelectField'
import RadioGroup from '../../../shared/components/RadioGroup'
import FormField from '../../../shared/components/forms/FormField'
import SubmitButton from '../../../shared/components/forms/SubmitButton'

export default function CrearPublicacion() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    description: '',
    history: '',
    type: 'venta',
    photos: [],
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Limpiar error del campo cuando empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleAddPhoto = (url) => {
    setForm({ ...form, photos: [...form.photos, url] })
    if (errors.photos) {
      setErrors({ ...errors, photos: '' })
    }
  }

  const handleRemovePhoto = (index) => {
    setForm({
      ...form,
      photos: form.photos.filter((_, i) => i !== index),
    })
  }

  const validateForm = () => {
    const newErrors = {}

    const titleErr = validateTitle(form.title)
    if (titleErr) newErrors.title = titleErr

    const priceErr = validatePrice(form.price, form.type)
    if (priceErr) newErrors.price = priceErr

    const categoryErr = validateCategory(form.category)
    if (categoryErr) newErrors.category = categoryErr

    const conditionErr = validateCondition(form.condition)
    if (conditionErr) newErrors.condition = conditionErr

    const locationErr = validateLocationPublication(form.location)
    if (locationErr) newErrors.location = locationErr

    const descErr = validateDescription(form.description)
    if (descErr) newErrors.description = descErr

    const historyErr = validateHistory(form.history)
    if (historyErr) newErrors.history = historyErr

    const typeErr = validatePublicationType(form.type)
    if (typeErr) newErrors.type = typeErr

    const photosErr = validatePhotos(form.photos)
    if (photosErr) newErrors.photos = photosErr

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const response = await createPublication({
        title: form.title.trim(),
        description: form.description.trim(),
        history: form.history.trim(),
        category: form.category,
        condition: form.condition,
        type: form.type,
        photos: form.photos,
        ...(form.price && { price: parseFloat(form.price) }),
        ...(form.location && { location: form.location.trim() }),
      })

      toast.success('Publicación creada exitosamente!')
      // Redirigir a la publicación creada o a mis publicaciones
      navigate(`/publication/${response._id}`)
    } catch (err) {
      console.error('Error creating publication:', err)
      const errorMsg =
        err.response?.data?.message || 'Error al crear la publicación'
      toast.error(errorMsg)
      setErrors({ general: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-warm mb-2">
            Crear Publicación
          </h1>
          <p className="text-gray-600">
            Comparte un objeto que desees vender o intercambiar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Error general */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-8">
            {/* Sección: Información Básica */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-bold text-dark-warm mb-6">
                Información Básica
              </h2>

              {/* Fila 1: Título y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Título"
                  error={errors.title}
                  required
                >
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="ej. PlayStation 5 Como Nueva"
                    maxLength="100"
                    className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light ${
                      errors.title
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
                    }`}
                  />
                </FormField>

                <FormField
                  label="Precio"
                  error={errors.price}
                  required={form.type !== 'trueque'}
                >
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="ej. 15000"
                    min="0"
                    step="100"
                    className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light ${
                      errors.price
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
                    }`}
                  />
                </FormField>
              </div>

              {/* Fila 2: Categoría y Estado */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Categoría"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  options={PUBLICATION_CATEGORIES}
                  error={errors.category}
                  required
                />

                <SelectField
                  label="Estado del Objeto"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  options={PUBLICATION_CONDITIONS}
                  error={errors.condition}
                  required
                />
              </div>

              {/* Fila 3: Ubicación */}
              <div className="mt-6 grid grid-cols-1 gap-6">
                <FormField
                  label="Ubicación"
                  error={errors.location}
                >
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="ej. Buenos Aires, CABA"
                    maxLength="100"
                    className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light ${
                      errors.location
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            {/* Sección: Descripción */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-bold text-dark-warm mb-6">
                Descripción del Objeto
              </h2>

              <FormField
                label="Descripción"
                error={errors.description}
                required
              >
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe el objeto: características, funcionalidad, detalles importantes..."
                  maxLength="1000"
                  rows="4"
                  className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light resize-none ${
                    errors.description
                      ? 'border-red-500 bg-red-50 focus:ring-red-300'
                      : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
                  }`}
                />
              </FormField>

              <div className="mt-6">
                <FormField
                  label="Historia del Objeto"
                  error={errors.history}
                  required
                >
                  <textarea
                    name="history"
                    value={form.history}
                    onChange={handleChange}
                    placeholder="¿De dónde viene? ¿Cuánto tiempo lo has tenido? ¿Por qué lo vendes?"
                    maxLength="2000"
                    rows="4"
                    className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light resize-none ${
                      errors.history
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            {/* Sección: Tipo de Publicación */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-bold text-dark-warm mb-6">
                ¿Qué deseas hacer?
              </h2>

              <RadioGroup
                label="Tipo de Publicación"
                name="type"
                value={form.type}
                onChange={handleChange}
                options={PUBLICATION_TYPES}
                error={errors.type}
                required
              />
            </div>

            {/* Sección: Fotos */}
            <div className="pb-8">
              <h2 className="text-xl font-bold text-dark-warm mb-6">
                Fotos del Objeto
              </h2>

              <ImageUpload
                images={form.photos}
                onAddImage={handleAddPhoto}
                onRemoveImage={handleRemovePhoto}
                error={errors.photos}
                disabled={loading}
              />

              <p className="text-sm text-gray-600 mt-4">
                💡 Las fotos son muy importantes. Asegúrate de que se vea bien el objeto desde diferentes ángulos.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg border-2 border-brand-light text-brand-light font-semibold hover:bg-brand-light/10 transition"
              >
                Cancelar
              </button>

              <SubmitButton
                label="Crear Publicación"
                loading={loading}
                loadingLabel="Creando..."
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
