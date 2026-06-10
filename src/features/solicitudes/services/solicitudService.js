/**
 * Servicio de Intercambios (Exchanges)
 *
 * Todos los endpoints apuntan a exchanges
 * El token JWT se adjunta automáticamente por el interceptor de api.js.
 */

import api from '../../../services/api'

/**
 * Envía una nueva solicitud de intercambio.
 *
 * requestedPublicationId - ID de la publicación que quiero obtener.
 * offeredPublicationId   - ID de mi publicación que ofrezco.
 * complementaryAmount    - Monto complementario en ARS (≥ 0, default 0).
 */
export async function enviarSolicitud({ requestedPublicationId, offeredPublicationId, complementaryAmount = 0 }) {
  const response = await api.post('/exchanges', {
    requestedPublicationId,
    offeredPublicationId,
    complementaryAmount,
    type: 'exchange',
  })
  return response.data
}

/**
 * Envía una solicitud de COMPRA directa (sin producto propio para intercambio).
 * El backend crea un Exchange con type="purchase" y abre el chat inmediatamente.
 *
 * requestedPublicationId - ID de la publicación que quiero comprar.
 */
export async function enviarSolicitudCompra(requestedPublicationId) {
  const response = await api.post('/exchanges', {
    requestedPublicationId,
    type: 'purchase',
  })
  return response.data
}

/**
 * Obtiene las publicaciones del usuario autenticado para el selector del modal.
 */
export async function getMisPublicaciones() {
  const response = await api.get('/users/me/publications')
  return response.data
}

/**
 * Obtiene las solicitudes de intercambio RECIBIDAS por el usuario autenticado.
 *
 * Filtros opcionales: { status, page, limit }
 */
export async function getSolicitudesRecibidas(params = {}) {
  const response = await api.get('/exchanges/received', { params })
  return response.data
}

/**
 * Obtiene las solicitudes de intercambio ENVIADAS por el usuario autenticado.
 *
 * Filtros opcionales: { status, page, limit }
 */
export async function getSolicitudesEnviadas(params = {}) {
  const response = await api.get('/exchanges/sent', { params })
  return response.data
}

/**
 * Acepta una solicitud de intercambio recibida.
 */
export async function aceptarSolicitud(id) {
  const response = await api.patch(`/exchanges/${id}/accept`)
  return response.data
}

/**
 * Rechaza una solicitud de intercambio recibida.
 */
export async function rechazarSolicitud(id) {
  const response = await api.patch(`/exchanges/${id}/reject`)
  return response.data
}
/**
 * Confirma la realización de un intercambio.
 */
export async function confirmarIntercambio(id) {
  const response = await api.patch(`/exchanges/${id}/confirm`)
  return response.data
}

/**
 * Cancela un intercambio en curso (H3.5).
 */
export async function cancelarIntercambio(id) {
  const response = await api.patch(`/exchanges/${id}/cancel`)
  return response.data
}

/**
 * Obtiene los detalles de un intercambio por ID.
 */
export async function getIntercambio(id) {
  const response = await api.get(`/exchanges/${id}`)
  return response.data
}

/**
 * Retorna todos los intercambios con chat habilitado (active/completed/cancelled),
 * mergeando recibidos y enviados, ordenados por última actividad (más reciente primero).
 */
export async function getMisChats() {
  const CHAT_STATUSES = ['active', 'completed', 'cancelled']
  const normalize = (data) => Array.isArray(data) ? data : (data?.exchanges ?? [])
  const [recibidas, enviadas] = await Promise.all([
    getSolicitudesRecibidas(),
    getSolicitudesEnviadas(),
  ])
  return [...normalize(recibidas), ...normalize(enviadas)]
    .filter(e => CHAT_STATUSES.includes(e.status))
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt ?? a.createdAt ?? 0)
      const dateB = new Date(b.updatedAt ?? b.createdAt ?? 0)
      return dateB - dateA
    })
}
