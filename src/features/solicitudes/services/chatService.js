/**
 * chatService.js
 *
 * Endpoint: GET /api/exchanges/:id/messages
 * Respuesta: { messages, hasMore, exchangeStatus }
 *
 * Campos de cada mensaje:
 *   _id       — ID único del mensaje
 *   content   — texto del mensaje
 *   sender    — { _id, nombre, apellido, photo }
 *   createdAt — ISO timestamp
 */

import api from '../../../services/api'

/**
 * Obtiene el historial de mensajes de un intercambio.
 * El backend valida:
 *   - Que el usuario sea requester u owner (403 si no)
 *   - Que el intercambio esté en active/completed/cancelled (403 si pending/rejected)
 *   - Que el intercambio exista (404)
 *
 * Soporta paginación por cursor:
 *   before — _id del mensaje más antiguo ya cargado (cursor)
 *   limit  — cantidad de mensajes por página (default 20)
 */
export async function getHistorialMensajes(intercambioId, { before, limit } = {}) {
  const params = {}
  if (before) params.before = before
  if (limit)  params.limit  = limit
  const response = await api.get(`/exchanges/${intercambioId}/messages`, { params })
  return response.data // { messages, hasMore, exchangeStatus }
}
