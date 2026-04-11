import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import useAuthStore from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email))
      errs.email = 'Ingresá un email válido'

    if (form.password.length < 8)
      errs.password = 'Mínimo 8 caracteres'

    if (form.confirm !== form.password)
      errs.confirm = 'Las contraseñas no coinciden'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) return setErrors(errs)

    setLoading(true)
    setErrors({})

    try {
      const data = await register(form.email, form.password)
      setAuth(data.user, data.token)
      navigate('/complete-profile')
    } catch (err) {
      if (err.response?.status === 409) {
        setErrors({ email: 'El email ya está en uso' })
      } else {
        setErrors({ general: 'Ocurrió un error, intentá de nuevo' })
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-sm">

        <h1 className="text-center text-2xl font-bold text-blue-600 mb-1">Fleeswap</h1>
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-1">Crear cuenta</h2>
        <p className="text-center text-sm text-gray-400 mb-8">Accede a tu archivo digital de nostalgia</p>

        {errors.general && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4 text-center">
            {errors.general}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm outline-none transition
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm outline-none transition
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm outline-none transition
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
              text-white font-semibold py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Registrando...
              </>
            ) : (
              'Registrarse →'
            )}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Iniciá sesión
          </Link>
        </p>

      </div>

      <p className="text-xs text-gray-300 mt-6 uppercase tracking-widest">
        © 2024 Fleeswap — El archivo digital de tu nostalgia.
      </p>
    </div>
  )
}
