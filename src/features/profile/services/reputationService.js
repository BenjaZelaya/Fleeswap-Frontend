import api from '../../../services/api'

/**
 * Obtiene la reputación de un usuario específico.
 * Se asume la existencia de la ruta en el backend.
 * 
 * @param {string} userId - El ID del usuario
 * @returns {Promise<Object>} Datos de reputación (ratingPromedio, totalCompletados, totalCancelados, reseñas)
 */
export async function getReputacionUsuario(userId) {
  const response = await api.get(`/users/${userId}/reputation`)
  return response.data
}
