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
        set({ user: user ? { ...user, role } : null, token })
      },

      updateUser: (userData) =>
        set((state) => ({ user: { ...state.user, ...userData } })),

      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'fleeswap-auth',
      // Solo persiste el objeto user — el token NUNCA va a localStorage
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useAuthStore
