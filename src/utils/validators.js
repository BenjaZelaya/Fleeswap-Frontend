import { EMAIL_REGEX, PASSWORD_MIN, NOMBRE_MIN, NOMBRE_MAX, AGE_MIN } from './constants'

export function validateEmail(value) {
  if (!value?.trim()) return 'El email es obligatorio'
  if (!EMAIL_REGEX.test(value)) return 'Ingresá un email válido'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < PASSWORD_MIN) return `Mínimo ${PASSWORD_MIN} caracteres`
  return ''
}

export function validatePasswordMatch(password, confirm) {
  if (!confirm) return 'Confirmá tu contraseña'
  if (password !== confirm) return 'Las contraseñas no coinciden'
  return ''
}

export function validateName(value, label = 'Este campo') {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return `${label} es obligatorio`
  if (trimmed.length < NOMBRE_MIN) return `Mínimo ${NOMBRE_MIN} caracteres`
  if (trimmed.length > NOMBRE_MAX) return `Máximo ${NOMBRE_MAX} caracteres`
  return ''
}

export function validateBirthDate(value) {
  if (!value) return 'La fecha de nacimiento es obligatoria'
  const birth = new Date(value)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  if (age < AGE_MIN) return `Debés tener al menos ${AGE_MIN} años para registrarte`
  return ''
}
