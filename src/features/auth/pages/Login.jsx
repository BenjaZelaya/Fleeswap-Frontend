import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../services/authService'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      return setErrors({ general: 'Completá todos los campos' })
    }

    setLoading(true)
    setErrors({})

    try {
      const data = await login(form.email, form.password)
      setAuth(data.user, data.token)
      const from = location.state?.from?.pathname || '/'
      navigate(from)
    } catch (err) {
      setErrors({ general: 'Email o contraseña incorrectos' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-sm">

        <h1 className="text-center text-2xl font-bold text-blue-600 mb-1">Fleeswap</h1>
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-1">Iniciar sesión</h2>
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contraseña
              </label>
              <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                Ingresando...
              </>
            ) : (
              'Ingresar →'
            )}
          </button>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Regístrate ahora
          </Link>
        </p>

      </div>

      <p className="text-xs text-gray-300 mt-6 uppercase tracking-widest">
        © 2024 Fleeswap — El archivo digital de tu nostalgia.
      </p>
    </div>
  )
}
