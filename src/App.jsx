/**
 * Componente raíz de la aplicación.
 *
 * Responsabilidad principal: rehidratar la sesión al cargar la app.
 *
 * ¿Por qué es necesario?
 * El access token vive solo en memoria (Zustand). Al refrescar la página el store
 * se resetea a { user: null, token: null }. Para restaurar la sesión sin pedir al
 * usuario que vuelva a loguearse, llamamos a POST /auth/refresh en el primer render:
 * si hay una cookie de refresh token válida (httpOnly, la maneja el browser
 * automáticamente), el backend devuelve un nuevo access token.
 *
 * Flujo de rehidratación:
 * 1. refreshToken()   → obtiene el nuevo access token
 * 2. setToken()       → lo pone en el store para que el interceptor lo adjunte
 * 3. getMyProfile()   → obtiene los datos actualizados del usuario
 * 4. setAuth()        → hidrata el store completo
 * 5. authReady = true → el router renderiza con todo disponible
 *
 * El estado `authReady` evita que el router renderice rutas protegidas antes de
 * saber si hay sesión activa, previniendo redirecciones incorrectas al login.
 */

import { useEffect, useState } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import AppRouter from './routes/AppRouter'
import { refreshToken } from './features/auth/services/authService'
import { getMyProfile } from './features/profile/services/profileService'
import useAuthStore from './store/authStore'

function App() {
  // false mientras no sabemos si hay sesión activa
  const [authReady, setAuthReady] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    async function initAuth() {
      try {
        const { accessToken } = await refreshToken()

        // Seteamos el token antes de llamar a /users/me para que
        // el interceptor de request lo adjunte en el header
        useAuthStore.getState().setToken(accessToken)

        const user = await getMyProfile()
        setAuth(user, accessToken)
      } catch {
        // No hay sesión activa o la cookie expiró — estado inicial vacío, está bien
      } finally {
        setAuthReady(true)
      }
    }

    initAuth()
  }, [setAuth])

  // Mientras se verifica la sesión mostramos un spinner para evitar
  // flashes de rutas protegidas o redirecciones incorrectas
  if (!authReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F9F7F4' }}
      >
        <svg
          className="animate-spin h-8 w-8 text-brand"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
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
      <AppRouter />
    </HelmetProvider>
  )
}

export default App
