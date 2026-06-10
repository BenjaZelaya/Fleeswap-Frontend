/**
 * Store global de autenticación (Zustand)
 *
 * Decisiones de diseño:
 * - El access token vive SOLO en memoria (este store). No se persiste en
 *   localStorage para evitar exposición a XSS.
 * - El refresh token vive en una httpOnly cookie que maneja el backend
 *   automáticamente — el frontend nunca lo ve ni lo toca.
 * - Al recargar la app, App.jsx llama a POST /auth/refresh para rehidratar
 *   el estado si hay una sesión activa (la cookie viaja sola).
 * - Datos del usuario: se persisten en localStorage bajo la clave
 *   'fleeswap-auth' (solo el objeto user, nunca el token).
 *   Esto evita el flash de "no autenticado" mientras App.jsx obtiene
 *   un nuevo access token via cookie en cada recarga.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      // ── Estado ──────────────────────────────────────────────────────────────
      user: null,   // Objeto con los datos del usuario autenticado
      token: null,  // Access token JWT (en memoria, no en localStorage)

      // ── Acciones ─────────────────────────────────────────────────────────────

      setAuth: (user, token) => {
        let role = user?.role
        if (!role && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
            role = payload.role
          } catch {
            // Ignorar errores de parseo
          }
        }
        // Normalizar _id → id para que todos los componentes usen user.id de forma consistente
        const normalizedUser = user ? {
          ...user,
          id: user.id || user._id?.toString(),
          role,
        } : null
        set({ user: normalizedUser, token })
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? {
            ...state.user,
            ...userData,
            // Mantener normalización de id al actualizar
            id: userData.id || userData._id?.toString() || state.user.id,
          } : null
        })),

      setToken: (token) => set({ token }),

      // logout limpia TODO (llamado al cerrar sesión explícitamente)
      logout: () => set({ user: null, token: null }),

      // clearToken limpia solo el token en memoria (llamado si el refresh falla al iniciar)
      // El user del localStorage se preserva para evitar flash de contenido no autenticado
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'fleeswap-auth',
      // Solo persiste el objeto user — el token NUNCA va a localStorage
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
