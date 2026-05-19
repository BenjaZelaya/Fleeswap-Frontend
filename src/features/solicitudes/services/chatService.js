/**
 * chatService.js - H4.1: Servicio de Chat de Intercambio
 *
 * Consume el endpoint GET /api/exchanges/:id/messages del backend.
 * El token JWT se adjunta automáticamente por el interceptor de api.js.
 */

import api from '../../../services/api'

/**
 * Obtiene el historial de mensajes de un intercambio.
 * Requiere que el usuario sea participante (requester u owner) y que el
 * intercambio esté en estado 'active'. Si no, el backend devuelve 403/400.
 *
 * intercambioId - ID del intercambio.
 * Array de mensajes ordenados por fecha.
 */
export async function getHistorialMensajes(intercambioId) {
  const response = await api.get(`/exchanges/${intercambioId}/messages`)
  return response.data
}
