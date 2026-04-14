// Auth
export const EMAIL_MIN = 5
export const EMAIL_MAX = 100
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 64

// Nombre / apellido
export const NOMBRE_MIN = 2
export const NOMBRE_MAX = 50

// Edad
export const AGE_MIN = 18

// Perfil
export const BIO_MIN = 3
export const BIO_MAX = 300
export const LOCATION_MIN = 2
export const LOCATION_MAX = 100

// Regex — alineados con el backend
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NAME_REGEX = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s-]+$/
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
export const PASSWORD_DIGIT_REGEX = /\d/
export const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
