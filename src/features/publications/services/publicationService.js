import api from '../../../services/api'

export async function createPublication(publicationData) {
  const response = await api.post('/publications', publicationData)
  return response.data
}

export async function getPublications(filters = {}) {
  const response = await api.get('/publications', { params: filters })
  return response.data
}

export async function getMyPublications() {
  const response = await api.get('/users/me/publications')
  return response.data
}

export async function getPublicationById(id) {
  const response = await api.get(`/publications/${id}`)
  return response.data
}

export async function updatePublication(id, data) {
  const response = await api.patch(`/publications/${id}`, data)
  return response.data
}

export async function deletePublication(id) {
  await api.delete(`/publications/${id}`)
}
