import api from '../../../services/api'

export async function updateProfile(data) {
  const response = await api.patch('/users/me/profile', data)
  return response.data
}
