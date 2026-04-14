import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/authService'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import FormField from '../../../shared/components/forms/FormField'
import PasswordInput from '../../../shared/components/forms/PasswordInput'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validatePassword, validatePasswordMatch } from '../../../utils/validators'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <AuthLayout title="Link inválido" subtitle="Este link de recuperación no es válido o ya expiró">
        <div className="text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 font-medium hover:underline">
            Solicitar un nuevo link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  function validate() {
    return {
      password: validatePassword(form.password),
      confirm: validatePasswordMatch(form.password, form.confirm),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.values(errs).some(Boolean)) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      await resetPassword(token, form.password, form.confirm)
      navigate('/login', { state: { message: 'Contraseña restablecida. Ya podés iniciar sesión.' } })
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors({ general: 'El link expiró o ya fue utilizado. Solicitá uno nuevo.' })
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
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elegí una contraseña segura para tu cuenta">
      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4 text-center">
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Nueva contraseña" error={errors.password}>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />
        </FormField>

        <FormField label="Confirmar contraseña" error={errors.confirm}>
          <PasswordInput
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirm}
          />
        </FormField>

        <SubmitButton loading={loading} label="Restablecer contraseña" loadingLabel="Guardando..." />
      </form>
    </AuthLayout>
  )
}
