import api from '../../../services/api'

export async function getMyProfile() {
  const response = await api.get('/users/me')
  return response.data
}

export async function getPublicProfile(id) {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export async function updateProfile(data) {
  const response = await api.patch('/users/me/profile', data)
  return response.data
}
