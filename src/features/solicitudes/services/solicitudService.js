/**
 * Servicio de Solicitudes de Intercambio
 *
 * Encapsula todas las llamadas HTTP relacionadas con la entidad "solicitud".
 * Consume la instancia central de Axios (api.js) que ya gestiona:
 *   - Adjuntar el Bearer token en cada request.
 *   - Refrescar el access token automáticamente ante un 401.
 */

import api from '../../../services/api'

/**
 * Envía una nueva solicitud de intercambio al backend.
 *
 * ID de la publicación que interesa al emisor.
 * ID de la publicación propia que ofrece el emisor.
 * Compensación económica opcional (≥ 0).
 */
export async function enviarSolicitud({ publicacionDestinoId, publicacionOfertaId, monto = 0 }) {
  const response = await api.post('/solicitudes', {
    publicacionDestinoId,
    publicacionOfertaId,
    monto,
  })
  return response.data
}

/**
 * Obtiene la lista de publicaciones activas del usuario autenticado
 * para alimentar el selector dentro del modal.
 *
 * Reutiliza el endpoint ya existente en publicationService; lo re-exportamos
 * aquí para mantener la cohesión del módulo de solicitudes.
 *
 * Array de publicaciones propias del usuario.
 */
export async function getMisPublicaciones() {
  const response = await api.get('/users/me/publications')
  return response.data
}

/**
 * Obtiene todas las solicitudes de intercambio recibidas por el usuario autenticado.
 * El backend filtra por el receptor usando el JWT del header.
 *
 * Lista de solicitudes recibidas, ordenadas por fecha desc.
 */
export async function getSolicitudesRecibidas() {
  const response = await api.get('/solicitudes/recibidas')
  return response.data
}

/**
 * Obtiene todas las solicitudes de intercambio enviadas por el usuario autenticado.
 *
 * Lista de solicitudes enviadas, ordenadas por fecha desc.
 */
export async function getSolicitudesEnviadas() {
  const response = await api.get('/solicitudes/enviadas')
  return response.data
}
