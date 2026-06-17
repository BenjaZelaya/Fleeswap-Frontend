import api from '../../../services/api'

/**
 * Envía una calificación para un intercambio o compra finalizada.
 * 
 * @param {string} exchangeId - ID del intercambio o compra
 * @param {number} rating - Calificación de 1 a 5
 * @param {string} [comment] - Comentario opcional (máx 500 chars)
 * @returns {Promise<Object>} Respuesta del backend
 */
export const enviarCalificacion = async (exchangeId, rating, comment = null) => {
  const payload = {
    exchangeId,
    rating,
    ...(comment && { comment })
  }
  
  const response = await api.post('/reviews', payload)
  return response.data
}
