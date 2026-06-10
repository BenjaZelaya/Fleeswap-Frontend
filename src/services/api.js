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
import { getApiBaseUrl } from './runtimeConfig'

const api = axios.create({
  // REST siempre debe apuntar a la version /api del backend.
  // Los sockets se conectan a la raiz del servidor y no deben reutilizar esta URL.
  baseURL: getApiBaseUrl(),
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

// ── Singleton de refresh ──────────────────────────────────────────────────
// Almacena la promesa de refresh en curso. Si múltiples requests reciben 401
// simultáneamente (race condition con rotación de tokens), todas comparten
// la misma promesa en lugar de lanzar N refreshes — evita que el backend
// invalide el token rotado antes de que las demás requests puedan usarlo.
let refreshPromise = null

// ── Interceptor de RESPONSE ───────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    // Si no hay response o config, normalmente estamos ante un problema de red,
    // CORS o timeout. No intentamos refresh para no esconder el error real.
    if (!original || !error.response) {
      return Promise.reject(error)
    }

    // Solo intentamos el refresh si:
    // - recibimos un 401
    // - no lo hemos intentado ya (_retry)
    // - la petición que falló NO es el propio endpoint de refresh
    //   (evita el loop infinito: refresh falla → interceptor llama refresh → falla → ...)
    const isRefreshEndpoint = original.url?.includes('/auth/refresh')
    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint) {
      original._retry = true

      try {
        // Si ya hay un refresh en curso, reutilizarlo en lugar de lanzar uno nuevo.
        // El .finally garantiza que refreshPromise se limpia cuando termina (éxito o error).
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh')
            .then((res) => res.data)
            .finally(() => { refreshPromise = null })
        }

        const data = await refreshPromise

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
