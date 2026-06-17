import { useState } from 'react'
import { toast } from 'sonner'
import Select from 'react-select'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'
import { reportPublication } from '../services/publicationService'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam o publicidad no deseada' },
  { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
  { value: 'objeto_falso', label: 'El objeto no existe o es falso' },
  { value: 'descripcion_enganosa', label: 'Descripción engañosa' },
  { value: 'precio_abusivo', label: 'Precio abusivo' },
  { value: 'otro', label: 'Otro' },
]

const DETAILS_MAX = 500

const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? 'var(--color-brand, #1e3a5f)' : '#d1d5db',
    boxShadow: 'none',
    fontSize: '0.875rem',
    minHeight: '46px',
    backgroundColor: 'white',
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
    cursor: 'pointer'
  }),
  menuList: (base) => ({ ...base, maxHeight: '220px' }),
  menu: (base) => ({ ...base, zIndex: 9999 })
}

export default function ReportModal({ open, onClose, onSuccess, onAlreadyReported, publicationId }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    setReason('')
    setDetails('')
    setError('')
    onClose()
  }

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await reportPublication(publicationId, {
        reason,
        details: details.trim() || undefined,
      })
      toast.success('Reporte enviado. Lo revisaremos a la brevedad.')
      handleClose()
      onSuccess?.()
    } catch (err) {
      const status = err.response?.status
      if (status === 409) {
        handleClose()
        onAlreadyReported?.()
      } else if (status === 400) {
        handleClose()
      } else if (status === 422) {
        setError('Datos inválidos. Revisá los campos.')
      } else {
        toast.error('No se pudo enviar el reporte. Intentá de nuevo.')
        handleClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const counterColor =
    details.length > 490 ? 'text-red-500' :
      details.length > 450 ? 'text-amber-500' :
        'text-slate-400'

  return (
    <ConfirmModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Reportar publicación"
      message="Contanos qué está mal con esta publicación."
      confirmLabel="Enviar reporte"
      cancelLabel="Cancelar"
      loading={loading}
      confirmDisabled={!reason}
      size="md"
      descriptionAlign="left"
    >
      <div className="space-y-5 w-full mt-2">
        <div className="relative z-20">
          <label className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5">
            Motivo <span className="text-red-500">*</span>
          </label>
          <Select
            options={REPORT_REASONS}
            value={REPORT_REASONS.find(r => r.value === reason) || null}
            onChange={(opt) => {
              setReason(opt ? opt.value : '')
              setError('')
            }}
            placeholder="Elegí un motivo"
            isSearchable={false}
            classNamePrefix="rs"
            styles={SELECT_STYLES}
          />
        </div>

        <div className="relative z-10">
          <label
            htmlFor="report-details"
            className="block text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mb-1.5"
          >
            Detalles <span className="font-normal lowercase">(opcional)</span>
          </label>
          <textarea
            id="report-details"
            name="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={DETAILS_MAX}
            rows={3}
            placeholder="Agregá más detalles si querés (opcional)"
            className={`w-full px-4 py-3 rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:ring-0 resize-y ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-brand hover:border-gray-400'
              }`}
          />
          {details.length > 0 && (
            <p
              aria-live="polite"
              aria-atomic="true"
              className={`text-xs text-right transition-colors mt-1 ${counterColor}`}
            >
              {details.length}/{DETAILS_MAX}
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-600 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {!reason && (
          <p className="text-xs text-slate-400 text-center">
            Elegí un motivo para habilitar el envío
          </p>
        )}
      </div>
    </ConfirmModal>
  )
}
