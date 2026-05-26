import api from '../../../services/api'

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

export const getAdminUsers = async (params = {}) => {
  // params puede incluir: search, role, isActive, page, limit
  const response = await api.get('/admin/users', { params })
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

// ── Reportes ─────────────────────────────────────────────────────────────────
export const getAdminReportes = async (params = {}) => {
  // params puede incluir: status, reason, page, limit
  const response = await api.get('/admin/reports', { params })
  return response.data
}

export const resolverReporte = async (id, action) => {
  // action: 'suspend_publication' | 'dismiss'
  const response = await api.patch(`/admin/reports/${id}/resolve`, { action })
  return response.data
}
