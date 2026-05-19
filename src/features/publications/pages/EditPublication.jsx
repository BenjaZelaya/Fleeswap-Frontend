import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Select from 'react-select'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import useAuthStore from '../../../store/authStore'
import {
  getPublicationById,
  updatePublication,
} from '../services/publicationService'
import {
  validateTitle,
  validateHistory,
  validateCategory,
  validateCondition,
  validatePublicationType,
  validatePrice,
} from '../../../utils/validators'
import {
  PUBLICATION_CATEGORIES,
  PUBLICATION_CONDITIONS,
  PUBLICATION_TYPES,
} from '../../../utils/constants'
import { LOCALIDADES_TUCUMAN } from '../../../helpers/localidadesTucuman'
import ImageUpload from '../../../shared/components/ImageUpload'
import { logError, logInfo } from '../../../utils/logger'

const LOC_OPTIONS = LOCALIDADES_TUCUMAN.map((l) => ({ value: l, label: l }))

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
        ? '#f1f5f9'
        : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
  }),
  menuList: (base) => ({ ...base, maxHeight: '220px' }),
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 border-slate-100 mb-6">
      {title && (
        <h2 className="text-[10px] font-light uppercase tracking-[0.2em] mb-5 text-slate-400">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

export default function EditPublication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [originalPub, setOriginalPub] = useState(null)

  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    condition: '',
    location: null,
    description: '',
    history: '',
    type: 'venta',
    photos: [],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchPublication()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchPublication = async () => {
    try {
      setLoading(true)
      const pub = await getPublicationById(id)

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
        location: pub.location ? { value: pub.location, label: pub.location } : null,
        photos: pub.photos || [],
      })
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar publicación'
      logError('Error al cargar publicación:', err)
      toast.error(message)
      navigate('/my-publications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (form.type === 'trueque') {
      setForm((prev) => ({ ...prev, price: '' }))
      setErrors((prev) => ({ ...prev, price: '' }))
    }
  }, [form.type])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleAddPhoto = (url) => {
    if (form.photos.length < 5) {
      setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }))
      if (errors.photos) setErrors((prev) => ({ ...prev, photos: '' }))
    }
  }
  const handleRemovePhoto = (index) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  const validateForm = () => {
    const e = {}
    const titleErr = validateTitle(form.title)
    if (titleErr) e.title = titleErr

    if (form.type !== 'trueque') {
      const priceErr = validatePrice(form.price, form.type)
      if (priceErr) e.price = priceErr
    }

    const catErr = validateCategory(form.category)
    if (catErr) e.category = catErr

    const condErr = validateCondition(form.condition)
    if (condErr) e.condition = condErr

    if (!form.location) e.location = 'Seleccioná una localidad'

    const histErr = validateHistory(form.history)
    if (histErr) e.history = histErr

    const typeErr = validatePublicationType(form.type)
    if (typeErr) e.type = typeErr

    if (form.photos.length === 0) {
      e.photos = 'Debe haber al menos 1 foto'
    }

    return e
  }

  const calculateChanges = () => {
    const changes = {}
    if ((form.title || '').trim() !== (originalPub?.title || '').trim()) changes.title = (form.title || '').trim()
    if ((form.description || '').trim() !== (originalPub?.description || '').trim()) changes.description = (form.description || '').trim()
    if ((form.history || '').trim() !== (originalPub?.history || '').trim()) changes.history = (form.history || '').trim()
    if ((form.category || '') !== (originalPub?.category || '')) changes.category = form.category || ''
    if ((form.condition || '') !== (originalPub?.condition || '')) changes.condition = form.condition || ''
    if ((form.type || '') !== (originalPub?.type || '')) changes.type = form.type || ''

    if ((form.type || '') !== 'trueque') {
      const formPrice = (form.price || '').trim()
      const newPrice = formPrice ? parseInt(formPrice, 10) : null
      const originalPrice = originalPub?.price || null
      if (newPrice !== originalPrice) changes.price = newPrice
    }

    if ((form.location?.value || '').trim() !== (originalPub?.location || '').trim()) changes.location = (form.location?.value || '').trim()
    if (JSON.stringify(form.photos || []) !== JSON.stringify(originalPub?.photos || [])) changes.photos = form.photos || []

    return changes
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Completá todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)

      const dataToSend = {
        title: form.title.trim(),
        description: form.description.trim() || 'Sin descripción',
        history: form.history.trim(),
        category: form.category,
        condition: form.condition,
        type: form.type,
        location: (form.location?.value || '').trim(),
        photos: form.photos,
      }

      if (form.type !== 'trueque') {
        const priceNum = form.price ? parseInt(form.price, 10) : null
        if (priceNum && priceNum > 0) {
          dataToSend.price = priceNum
        }
      }

      logInfo('Datos a enviar:', dataToSend)
      await updatePublication(id, dataToSend)

      toast.success('¡Publicación editada exitosamente!')
      setTimeout(() => navigate('/my-publications'), 500)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar publicación'
      logError('Error al actualizar:', err)
      toast.error(errorMsg)
      setErrors({ general: errorMsg })
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:ring-0 ${errors[field]
      ? 'border-red-400 focus:border-red-500'
      : 'border-gray-300 focus:border-brand hover:border-gray-400'
    }`

  const hasChanges = Object.keys(calculateChanges()).length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-4"
    >
      {/* Encabezado de página */}
      <div className="flex items-center justify-between py-2 mb-2 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Editar publicación</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Sección 1: Fotos ── */}
        <Section title="Foto del Producto">
          <ImageUpload
            images={form.photos}
            onAddImage={handleAddPhoto}
            onRemoveImage={handleRemovePhoto}
            error={errors.photos}
            disabled={submitting}
          />
          {errors.photos && <p className="text-[11px] text-red-500 mt-2">{errors.photos}</p>}
          <p className="text-[11px] text-gray-400 mt-3">
            💡 Las fotos son muy importantes. Mostrá el objeto desde distintos ángulos.
          </p>
        </Section>

        {/* ── Sección 2: ¿Qué querés hacer? ── */}
        <Section title="Modalidad">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PUBLICATION_TYPES.map((typeOption) => {
              const isSelected = form.type === typeOption.value
              return (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: typeOption.value } })}
                  className={`relative p-4 rounded-xl border text-left transition-all ${isSelected
                    ? 'border-brand bg-brand/5 ring-1 ring-brand'
                    : 'border-slate-200 bg-white hover:border-brand/30 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-brand' : 'text-slate-700'}`}>
                      {typeOption.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand bg-brand' : 'border-slate-300'
                      }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {typeOption.value === 'trueque' && 'Objeto por objeto'}
                    {typeOption.value === 'venta' && 'Precio fijo'}
                    {typeOption.value === 'ambos' && 'Dinero o trueque'}
                  </p>
                </button>
              )
            })}
          </div>
          {errors.type && <p className="text-[11px] text-red-500 mt-2">{errors.type}</p>}
        </Section>

        {/* ── Sección 3: Información básica ── */}
        <Section title="Información Básica">
          <div className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ej: Reloj Casio A1585 Como Nuevo"
                maxLength="100"
                className={inputClass('title')}
              />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Precio {form.type !== 'trueque' && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder={form.type === 'trueque' ? 'No aplica (solo trueque)' : 'Ej: 15000'}
                  min="0"
                  step="100"
                  disabled={form.type === 'trueque'}
                  className={`pl-7 ${inputClass('price')} ${form.type === 'trueque' ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                />
              </div>
              {form.type === 'trueque' && (
                <p className="text-[11px] text-amber-600 mt-1">El precio no aplica para publicaciones de solo trueque.</p>
              )}
              {errors.price && <p className="text-[11px] text-red-500 mt-1">{errors.price}</p>}
            </div>

            {/* Categoría y Condición */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <Select
                  options={PUBLICATION_CATEGORIES}
                  value={PUBLICATION_CATEGORIES.find(c => c.value === form.category) || null}
                  onChange={(opt) => {
                    setForm((prev) => ({ ...prev, category: opt ? opt.value : '' }))
                    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
                  }}
                  placeholder="— Seleccioná —"
                  isClearable
                  isSearchable={false}
                  styles={SELECT_STYLES}
                  classNamePrefix="rs"
                />
                {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Estado del Objeto <span className="text-red-500">*</span>
                </label>
                <Select
                  options={PUBLICATION_CONDITIONS}
                  value={PUBLICATION_CONDITIONS.find(c => c.value === form.condition) || null}
                  onChange={(opt) => {
                    setForm((prev) => ({ ...prev, condition: opt ? opt.value : '' }))
                    if (errors.condition) setErrors((prev) => ({ ...prev, condition: '' }))
                  }}
                  placeholder="— Seleccioná —"
                  isClearable
                  isSearchable={false}
                  styles={SELECT_STYLES}
                  classNamePrefix="rs"
                />
                {errors.condition && <p className="text-[11px] text-red-500 mt-1">{errors.condition}</p>}
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <Select
                inputId="location-select"
                options={LOC_OPTIONS}
                value={form.location}
                onChange={(opt) => {
                  setForm((prev) => ({ ...prev, location: opt }))
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }))
                }}
                placeholder="Buscá tu localidad..."
                noOptionsMessage={() => 'Sin resultados'}
                styles={SELECT_STYLES}
                classNamePrefix="rs"
                isSearchable
              />
              {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>
        </Section>

        {/* ── Sección 4: Descripción ── */}
        <Section title="Detalles">
          <div className="space-y-5">
            {/* Descripción */}
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Descripción <span className="text-gray-400 font-normal lowercase">(opcional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Características, funcionalidad, detalles importantes... (opcional)"
                maxLength="1000"
                rows="3"
                className={`${inputClass('description')} resize-none`}
              />
              {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Historia */}
            <div>
              <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Historia del Objeto <span className="text-red-500">*</span>
              </label>
              <textarea
                name="history"
                value={form.history}
                onChange={handleChange}
                placeholder="¿De dónde viene? ¿Cuánto tiempo lo tuviste? ¿Por qué lo vendés o intercambiás?"
                maxLength="2000"
                rows="4"
                className={`${inputClass('history')} resize-none`}
              />
              {errors.history && <p className="text-[11px] text-red-500 mt-1">{errors.history}</p>}
            </div>
          </div>
        </Section>

        {/* Info de cambios */}
        {!hasChanges && (
          <p className="text-[11px] text-amber-500 text-center mb-2">
            Realizá algún cambio para poder guardar
          </p>
        )}

        {/* Botones */}
        <div className="pt-2 pb-12 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-publications')}
            className="w-full sm:w-1/3 py-3.5 px-4 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !hasChanges}
            className="w-full sm:w-2/3 bg-brand text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-brand-light transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
