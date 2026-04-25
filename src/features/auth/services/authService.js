import api from '../../../services/api'

export async function refreshToken() {
  const response = await api.post('/auth/refresh')
  return response.data // { accessToken }
}

export async function register(data) {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function logout() {
  await api.post('/auth/logout')
}

export async function changePassword(passwordActual, passwordNueva, confirmPassword) {
  const response = await api.patch('/auth/change-password', {
    passwordActual,
    passwordNueva,
    confirmPassword,
  })
  return response.data
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export async function resetPassword(token, password, confirmPassword) {
  const response = await api.post('/auth/reset-password', { token, password, confirmPassword })
  return response.data
}
