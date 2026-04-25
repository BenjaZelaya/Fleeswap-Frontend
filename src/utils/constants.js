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

// Publicaciones
export const TITLE_MIN = 5
export const TITLE_MAX = 100
export const DESCRIPTION_MIN = 20
export const DESCRIPTION_MAX = 1000
export const HISTORY_MIN = 10
export const HISTORY_MAX = 2000
export const PHOTOS_MIN = 1
export const PHOTOS_MAX = 5

export const PUBLICATION_CATEGORIES = [
  { value: 'electronica', label: 'Electrónica' },
  { value: 'ropa_accesorios', label: 'Ropa y Accesorios' },
  { value: 'coleccionables', label: 'Coleccionables' },
  { value: 'libros_comics', label: 'Libros y Cómics' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'hogar_deco', label: 'Hogar y Decoración' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'arte', label: 'Arte' },
  { value: 'musica', label: 'Música' },
  { value: 'otros', label: 'Otros' },
]

export const PUBLICATION_CONDITIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como_nuevo', label: 'Como Nuevo' },
  { value: 'bueno', label: 'Bueno' },
  { value: 'regular', label: 'Regular' },
  { value: 'deteriorado', label: 'Deteriorado' },
]

export const PUBLICATION_TYPES = [
  { value: 'venta', label: 'Venta' },
  { value: 'trueque', label: 'Trueque' },
  { value: 'ambos', label: 'Venta y Trueque' },
]

// Regex — alineados con el backend
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NAME_REGEX = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s-]+$/
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/
export const PASSWORD_DIGIT_REGEX = /\d/
export const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
