import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../../features/auth/store/authStore'
import { logout as logoutService } from '../../../features/auth/services/authService'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [loggingOut, setLoggingOut] = useState(false)

  const isAuthenticated = !!token
  const displayName = user?.nombre ?? user?.email?.split('@')[0] ?? ''

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logoutService()
    } catch {
      // Si falla el endpoint igual limpiamos el estado local
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
          Fleeswap
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm font-medium text-gray-500 hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
