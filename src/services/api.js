/**
 * Instancia central de Axios para todas las peticiones al backend.
 *
 * Interceptores configurados:
 *
 * REQUEST — adjunta el access token (desde el store en memoria) a cada
 *   petición como Authorization: Bearer <token>.
 *
 * RESPONSE — maneja errores 401 (token expirado):
 *   1. Llama a POST /auth/refresh (la cookie httpOnly viaja automáticamente).
 *   2. Guarda el nuevo access token en el store.
 *   3. Reintenta la petición original con el token renovado.
 *   4. Si el refresh también falla (sesión inválida), limpia el store.
 *   El flag `_retry` evita loops infinitos si el refresh devuelve 401.
 */

import axios from 'axios'
// Importamos el store directamente (fuera de un componente) para leer/escribir
// el token sin necesidad de hooks. Zustand lo permite con .getState().
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // necesario para enviar/recibir la cookie del refresh token
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Interceptor de REQUEST ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Interceptor de RESPONSE ───────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Solo intentamos el refresh si:
    // - recibimos un 401
    // - no lo hemos intentado ya (_retry)
    // - la petición que falló NO es el propio endpoint de refresh
    //   (evita el loop infinito: refresh falla → interceptor llama refresh → falla → ...)
    const isRefreshEndpoint = original.url?.includes('/auth/refresh')
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true

      try {
        // El refresh token viaja automáticamente en la cookie httpOnly
        const { data } = await api.post('/auth/refresh')

        // Guardamos el nuevo access token en el store (en memoria)
        useAuthStore.getState().setToken(data.accessToken)

        // Reintentamos la petición original con el token renovado
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        // El refresh falló (sesión expirada o inválida) → limpiamos el store
        useAuthStore.getState().logout()
      }
    }

    return Promise.reject(error)
  }
)

export default api
