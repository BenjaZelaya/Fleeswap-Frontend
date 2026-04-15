import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../services/authService'
import FormField from '../../../shared/components/forms/FormField'
import PasswordInput from '../../../shared/components/forms/PasswordInput'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validatePassword, validatePasswordMatch } from '../../../utils/validators'

export default function ChangePassword() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ passwordActual: '', passwordNueva: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const errs = {}
    if (!form.passwordActual) errs.passwordActual = 'La contraseña actual es obligatoria'
    errs.passwordNueva = validatePassword(form.passwordNueva)
    errs.confirm = validatePasswordMatch(form.passwordNueva, form.confirm)
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.values(errs).some(Boolean)) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      await changePassword(form.passwordActual, form.passwordNueva, form.confirm)
      setSuccess(true)
      setForm({ passwordActual: '', passwordNueva: '', confirm: '' })
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ passwordActual: 'La contraseña actual es incorrecta' })
      } else {
        setErrors({ general: 'Ocurrió un error. Intentá de nuevo.' })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setSuccess(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cambiar contraseña</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.general}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Contraseña actualizada correctamente.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Contraseña actual" error={errors.passwordActual}>
            <PasswordInput
              name="passwordActual"
              value={form.passwordActual}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.passwordActual}
            />
          </FormField>

          <div className="h-px bg-gray-100" />

          <FormField label="Nueva contraseña" error={errors.passwordNueva}>
            <PasswordInput
              name="passwordNueva"
              value={form.passwordNueva}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.passwordNueva}
            />
          </FormField>

          <FormField label="Confirmar nueva contraseña" error={errors.confirm}>
            <PasswordInput
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirm}
            />
          </FormField>

          <SubmitButton loading={loading} label="Actualizar contraseña" loadingLabel="Guardando..." />
        </form>
      </div>
    </div>
  )
}
