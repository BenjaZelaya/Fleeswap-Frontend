import api from '../../../services/api'

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getAdminPublications = async (params = {}) => {
  // params puede incluir: status, category, page, limit
  const response = await api.get('/admin/publications', { params })
  return response.data
}

export const updatePublicationStatus = async (id, status) => {
  const response = await api.patch(`/admin/publications/${id}/status`, { status })
  return response.data
}

export const deletePublication = async (id) => {
  const response = await api.delete(`/admin/publications/${id}`)
  return response.data
}
