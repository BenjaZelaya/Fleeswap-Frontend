import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/authService'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import Seo from '../../../shared/components/Seo'
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
      <AuthLayout title="Link invalido" subtitle="Este link de recuperacion no es valido o ya expiro">
        <Seo page="resetPassword" />
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <Link to="/forgot-password" className="block text-sm font-semibold text-brand-accent transition-colors hover:text-brand">
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
      navigate('/login', { state: { message: 'Contrasena restablecida. Ya podes iniciar sesion.' } })
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors({ general: 'El link expiro o ya fue utilizado. Solicita uno nuevo.' })
      } else {
        setErrors({ general: 'Ocurrio un error. Intenta de nuevo.' })
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
    <AuthLayout title="Nueva contrasena" subtitle="Elige una contrasena segura para tu cuenta">
      <Seo page="resetPassword" />
      {errors.general && (
        <p className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Nueva contrasena" error={errors.password}>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />
        </FormField>

        <FormField label="Confirmar contrasena" error={errors.confirm}>
          <PasswordInput
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirm}
          />
        </FormField>

        <SubmitButton loading={loading} label="Restablecer contrasena" loadingLabel="Guardando..." />
      </form>
    </AuthLayout>
  )
}
