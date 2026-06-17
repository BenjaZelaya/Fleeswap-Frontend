/**
 * activeSearchService.js
 *
 * API client para búsquedas activas (/api/active-searches)
 * - GET: listar mis búsquedas
 * - POST: crear búsqueda
 * - PATCH: editar búsqueda
 * - DELETE: eliminar búsqueda
 */

import api from '../../../services/api'

function normalizeActiveSearchList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.searches)) return data.searches
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

/**
 * Obtiene todas las búsquedas activas del usuario autenticado
 */
export async function getMisBusquedas() {
  const response = await api.get('/active-searches')
  // El listado de busquedas es consumido por mas de una pantalla.
  // Normalizar aca evita que cada una asuma envelopes distintos.
  return normalizeActiveSearchList(response.data)
}

/**
 * Crea una nueva búsqueda activa
 * @param {Object} data - { category, keywords: [], type }
 */
export async function crear(data) {
  const response = await api.post('/active-searches', data)
  return response.data
}

/**
 * Edita una búsqueda existente
 * @param {string} id - ID de la búsqueda
 * @param {Object} data - Campos a actualizar
 */
export async function editar(id, data) {
  const response = await api.patch(`/active-searches/${id}`, data)
  return response.data
}

/**
 * Elimina una búsqueda
 * @param {string} id - ID de la búsqueda
 */
export async function eliminar(id) {
  const response = await api.delete(`/active-searches/${id}`)
  return response.data
}

/**
 * Activa/desactiva una búsqueda
 * @param {string} id - ID de la búsqueda
 * @param {boolean} isActive - Estado deseado
 */
export async function toggleActiva(id, isActive) {
  const response = await api.patch(`/active-searches/${id}`, { isActive })
  return response.data
}
