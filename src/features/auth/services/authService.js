import api from '../../../services/api'

export async function register(email, password) {
  const response = await api.post('/auth/register', { email, password })
  return response.data
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function updateProfile(data) {
  const response = await api.patch('/users/me/profile', data)
  return response.data
}
