/**
 * Componente raíz de la aplicación.
 *
 * Responsabilidad principal: rehidratar la sesión al cargar la app.
 */

import { useEffect, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import AppRouter from './routes/AppRouter'
import ErrorBoundary from './shared/components/ErrorBoundary'
import { refreshToken } from './features/auth/services/authService'
import { getMyProfile } from './features/profile/services/profileService'
import useAuthStore from './store/authStore'

function App() {
  const [authReady, setAuthReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    async function initAuth() {
      try {
        const { accessToken } = await refreshToken()
        useAuthStore.getState().setToken(accessToken)
        const user = await getMyProfile()
        setAuth(user, accessToken)
      } catch {
        // No hay sesión activa o la cookie expiró.
      } finally {
        setAuthReady(true)
      }
    }

    initAuth()
  }, [setAuth])

  if (!authReady) {
    return (
      <div
        role="status"
        aria-label="Cargando aplicación"
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F9F7F4' }}
      >
        <svg
          aria-hidden="true"
          className="animate-spin h-8 w-8 text-brand"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    )
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
