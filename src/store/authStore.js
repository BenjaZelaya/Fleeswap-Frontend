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
 * - Datos del usuario: también solo en memoria. No hay información sensible
 *   que persista entre recargas; se restaura junto con el token en el refresh.
 */

import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // ── Estado ──────────────────────────────────────────────────────────────
  user: null,   // Objeto con los datos del usuario autenticado
  token: null,  // Access token JWT (en memoria, no en localStorage)

  // ── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Guarda el usuario y el access token tras login, register o refresh.
   * @param {object} user  - Datos del usuario devueltos por el backend
   * @param {string} token - Access token JWT
   */
  setAuth: (user, token) => set({ user, token }),

  /**
   * Actualiza parcialmente los datos del usuario en el store
   * (ej: después de editar el perfil).
   * @param {object} userData - Campos a actualizar (merge con el estado actual)
   */
  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),

  /**
   * Actualiza solo el access token (usado por el interceptor 401
   * cuando renueva el token silenciosamente).
   * @param {string} token - Nuevo access token
   */
  setToken: (token) => set({ token }),

  /**
   * Limpia el estado de autenticación. El backend invalida la cookie
   * del refresh token al llamar POST /auth/logout.
   */
  logout: () => set({ user: null, token: null }),
}))

export default useAuthStore
