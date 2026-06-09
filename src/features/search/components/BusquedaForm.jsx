import { useState, useCallback } from 'react'
import Select from 'react-select'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PUBLICATION_CATEGORIES, PUBLICATION_TYPES } from '../../../utils/constants'

const MAX_KEYWORDS = 10
const MAX_KEYWORD_LENGTH = 50

// Custom Select styles (reusable)
const SELECT_STYLES = {
  control: (base) => ({
    ...base,
    borderColor: '#e2e8f0',
    borderRadius: '0.75rem',
    minHeight: '2.5rem',
    fontSize: '0.875rem',
  }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    backgroundColor: isSelected ? '#1b365d' : isFocused ? '#f1f5f9' : 'white',
    color: isSelected ? 'white' : '#1f2937',
    fontSize: '0.875rem',
  }),
}

// Normaliza keywords: elimina duplicados, transforma a lowercase, elimina espacios extra
const normalizeKeywords = (keywords) =>
  [...new Set(keywords.map(k => k.trim().toLowerCase()))]
    .filter(k => k.length > 0)
    .slice(0, MAX_KEYWORDS)

export default function BusquedaForm({
  initialData = null,
  onSubmit,
  loading = false,
  serverError = null,
}) {
  const [form, setForm] = useState({
    category: initialData?.category ?? '',
    keywords: initialData?.keywords ?? [],
    type: initialData?.type ?? 'ambos',
    keywordInput: '',
  })

  const [errors, setErrors] = useState({})

  const categoryOptions = PUBLICATION_CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label,
  }))

  // Agregar keyword
  const addKeyword = useCallback((keyword) => {
    const trimmed = keyword.trim().toLowerCase()
    if (!trimmed || trimmed.length > MAX_KEYWORD_LENGTH) return

    if (!form.keywords.includes(trimmed)) {
      const updated = [...form.keywords, trimmed].slice(0, MAX_KEYWORDS)
      setForm(prev => ({ ...prev, keywords: updated, keywordInput: '' }))
      setErrors(prev => ({ ...prev, keywords: '' }))
    }
  }, [form.keywords])

  // Remover keyword
  const removeKeyword = useCallback((index) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }))
  }, [])

  // Validación
  const validate = () => {
    const newErrors = {}
    if (!form.category) newErrors.category = 'Categoría es requerida'
    if (form.keywords.length === 0) newErrors.keywords = 'Al menos una palabra clave es recomendada'
    if (!form.type) newErrors.type = 'Tipo es requerido'
    return newErrors
  }

  // Manejo de submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      category: form.category,
      keywords: normalizeKeywords(form.keywords),
      type: form.type,
    }

    await onSubmit(payload)
  }

  // Manejo de Enter en input de keywords
  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword(form.keywordInput)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error del servidor */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Categoría */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Categoría <span className="text-red-500">*</span>
        </label>
        <Select
          options={categoryOptions}
          value={categoryOptions.find(opt => opt.value === form.category) || null}
          onChange={(opt) => {
            setForm(prev => ({ ...prev, category: opt?.value || '' }))
            setErrors(prev => ({ ...prev, category: '' }))
          }}
          placeholder="Seleccioná una categoría..."
          isDisabled={loading}
          styles={SELECT_STYLES}
          isClearable
        />
        {errors.category && (
          <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Palabras clave */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Palabras clave
          <span className="text-slate-400 font-normal text-xs ml-2">
            ({form.keywords.length}/{MAX_KEYWORDS})
          </span>
        </label>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={form.keywordInput}
            onChange={(e) => setForm(prev => ({ ...prev, keywordInput: e.target.value }))}
            onKeyDown={handleKeywordKeyDown}
            maxLength={MAX_KEYWORD_LENGTH}
            placeholder="Escribe y presiona Enter..."
            disabled={loading || form.keywords.length >= MAX_KEYWORDS}
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 disabled:bg-slate-50"
          />
          <button
            type="button"
            onClick={() => addKeyword(form.keywordInput)}
            disabled={loading || form.keywords.length >= MAX_KEYWORDS || !form.keywordInput.trim()}
            className="px-4 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Agregar
          </button>
        </div>

        {/* Tags de keywords */}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {form.keywords.map((keyword, index) => (
              <motion.div
                key={`${keyword}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full"
              >
                <span className="text-sm text-slate-700">{keyword}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  disabled={loading}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {errors.keywords && (
          <p className="text-[11px] text-amber-600 mt-2">{errors.keywords}</p>
        )}
      </div>

      {/* Tipo de publicación */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Tipo de publicación <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {[
            { value: 'trueque', label: 'Trueque' },
            { value: 'venta', label: 'Venta' },
            { value: 'ambos', label: 'Ambos' },
          ].map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={form.type === option.value}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, type: e.target.value }))
                  setErrors(prev => ({ ...prev, type: '' }))
                }}
                disabled={loading}
                className="w-4 h-4 text-brand accent-brand cursor-pointer"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p className="text-[11px] text-red-500 mt-1">{errors.type}</p>
        )}
      </div>

      {/* Botón submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-brand text-white font-semibold rounded-xl hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar búsqueda' : 'Crear búsqueda'}
        </button>
      </div>
    </form>
  )
}
