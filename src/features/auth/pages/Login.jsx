import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
import useAuthStore from '../../../store/authStore'
import AuthLayout from '../../../shared/components/layout/AuthLayout'
import FormField, { inputClass } from '../../../shared/components/forms/FormField'
import PasswordInput from '../../../shared/components/forms/PasswordInput'
import SubmitButton from '../../../shared/components/forms/SubmitButton'
import { validateEmail } from '../../../utils/validators'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs = {}
    const emailError = validateEmail(form.email)
    if (emailError) errs.email = emailError
    if (!form.password) errs.password = 'La contraseña es obligatoria'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      const data = await login(form.email, form.password)
      setAuth(data.user, data.accessToken)
      navigate(location.state?.from?.pathname || '/')
    } catch (err) {
      const status = err.response?.status
      if (!err.response) {
        setErrors({ general: 'No se pudo conectar con el servidor' })
      } else if (status === 401 || status === 400) {
        setErrors({ general: 'Email o contraseña incorrectos' })
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

  const successMessage = location.state?.message

  return (
    <AuthLayout title="Bienvenido de vuelta" subtitle="Iniciá sesión para continuar">
      {successMessage && (
        <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </p>
      )}
      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ejemplo@correo.com"
            className={inputClass(errors.email)}
          />
        </FormField>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs text-brand-accent hover:text-brand font-medium transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        <SubmitButton loading={loading} label="Iniciar sesión" loadingLabel="Ingresando..." />
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿No tenés una cuenta?{' '}
        <Link to="/register" className="text-brand font-semibold hover:text-brand-light transition-colors">
          Registrate
        </Link>
      </p>
    </AuthLayout>
  )
}
