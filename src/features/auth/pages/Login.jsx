import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
import useAuthStore from '../store/authStore'
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
      setAuth(data.user, data.token)
      const from = location.state?.from?.pathname || '/'
      navigate(from)
    } catch {
      setErrors({ general: 'Email o contraseña incorrectos' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accedé a tu archivo digital de nostalgia">
      {errors.general && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4 text-center">
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
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
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
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        <SubmitButton loading={loading} label="Ingresar →" loadingLabel="Ingresando..." />
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿No tenés una cuenta?{' '}
        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
          Registrate ahora
        </Link>
      </p>
    </AuthLayout>
  )
}
