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
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">Cambiar contraseña</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver
          </button>
        </div>

        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3 mb-6">
            {errors.general}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 rounded-lg px-4 py-3 mb-6">
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
