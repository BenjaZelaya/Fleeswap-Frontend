import api from '../../../services/api'

/**
 * Obtiene la reputación de un usuario específico.
 */
export async function getReputacionUsuario(userId) {
  const response = await api.get(`/users/${userId}/reputation`)
  return response.data
}
