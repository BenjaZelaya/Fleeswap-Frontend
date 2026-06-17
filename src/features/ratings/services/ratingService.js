import api from '../../../services/api'

/**
 * Envía una calificación para un intercambio o compra finalizada.
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
