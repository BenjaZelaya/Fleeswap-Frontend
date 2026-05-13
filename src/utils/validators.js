import {
  EMAIL_REGEX,
  EMAIL_MIN,
  EMAIL_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_DIGIT_REGEX,
  PASSWORD_SPECIAL_REGEX,
  NAME_REGEX,
  NOMBRE_MIN,
  NOMBRE_MAX,
  BIO_MIN,
  BIO_MAX,
  LOCATION_MIN,
  LOCATION_MAX,
  AGE_MIN,
  TITLE_MIN,
  TITLE_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
  HISTORY_MIN,
  HISTORY_MAX,
  PHOTOS_MAX,
} from './constants'

export function validateEmail(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'El email es obligatorio'
  if (trimmed.length < EMAIL_MIN) return `El email debe tener al menos ${EMAIL_MIN} caracteres`
  if (trimmed.length > EMAIL_MAX) return `El email no puede superar ${EMAIL_MAX} caracteres`
  if (!EMAIL_REGEX.test(trimmed)) return 'Ingresá un email válido'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < PASSWORD_MIN) return `Mínimo ${PASSWORD_MIN} caracteres`
  if (value.length > PASSWORD_MAX) return `Máximo ${PASSWORD_MAX} caracteres`
  if (!PASSWORD_UPPERCASE_REGEX.test(value)) return 'Debe contener al menos una mayúscula'
  if (!PASSWORD_DIGIT_REGEX.test(value)) return 'Debe contener al menos un número'
  if (!PASSWORD_SPECIAL_REGEX.test(value)) return 'Debe contener al menos un carácter especial'
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
  if (!NAME_REGEX.test(trimmed)) return `${label} solo puede contener letras, espacios y guiones`
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

// Campos opcionales: solo validan si tienen contenido
export function validateBio(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  if (trimmed.length < BIO_MIN) return `La bio debe tener al menos ${BIO_MIN} caracteres`
  if (trimmed.length > BIO_MAX) return `La bio no puede superar ${BIO_MAX} caracteres`
  return ''
}

export function validateLocation(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return ''
  if (trimmed.length < LOCATION_MIN) return `La ubicación debe tener al menos ${LOCATION_MIN} caracteres`
  if (trimmed.length > LOCATION_MAX) return `La ubicación no puede superar ${LOCATION_MAX} caracteres`
  return ''
}

// Publicaciones
export function validateTitle(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'El título es obligatorio'
  if (trimmed.length < TITLE_MIN) return `Mínimo ${TITLE_MIN} caracteres`
  if (trimmed.length > TITLE_MAX) return `Máximo ${TITLE_MAX} caracteres`
  return ''
}

export function validateDescription(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'La descripción es obligatoria'
  if (trimmed.length < DESCRIPTION_MIN) return `Mínimo ${DESCRIPTION_MIN} caracteres`
  if (trimmed.length > DESCRIPTION_MAX) return `Máximo ${DESCRIPTION_MAX} caracteres`
  return ''
}

export function validateHistory(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'La historia del objeto es obligatoria'
  if (trimmed.length < HISTORY_MIN) return `Mínimo ${HISTORY_MIN} caracteres`
  if (trimmed.length > HISTORY_MAX) return `Máximo ${HISTORY_MAX} caracteres`
  return ''
}

export function validateCategory(value) {
  if (!value) return 'La categoría es obligatoria'
  return ''
}

export function validateCondition(value) {
  if (!value) return 'El estado del objeto es obligatorio'
  return ''
}

export function validatePublicationType(value) {
  if (!value) return 'El tipo de publicación es obligatorio'
  return ''
}

export function validatePhotos(photos) {
  if (!photos || photos.length === 0) return 'Debes subir al menos 1 foto'
  if (photos.length > PHOTOS_MAX) return `Máximo ${PHOTOS_MAX} fotos`
  return ''
}

export function validatePrice(value, type) {
  // Precio es opcional solo si es trueque puro
  if (type === 'trueque') return ''
  
  const trimmed = value?.trim() ?? ''
  
  // Para venta o ambos, el precio es obligatorio
  if (!trimmed) return 'El precio es obligatorio'
  
  const price = parseFloat(trimmed)
  if (isNaN(price)) return 'El precio debe ser un número válido'
  if (price < 0) return 'El precio no puede ser negativo'
  if (price === 0) return 'El precio debe ser mayor a 0'
  
  return ''
}

export function validateLocationPublication(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return '' // Ubicación es opcional
  if (trimmed.length < LOCATION_MIN) return `Mínimo ${LOCATION_MIN} caracteres`
  if (trimmed.length > LOCATION_MAX) return `Máximo ${LOCATION_MAX} caracteres`
  return ''
}
