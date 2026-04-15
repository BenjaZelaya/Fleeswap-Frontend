// SEO Configuration for different pages
export const seoConfig = {
  home: {
    title: 'Fleeswap - Plataforma de Intercambio',
    description: 'Plataforma de intercambio seguro y confiable. Compra, vende e intercambia productos con confianza.',
    keywords: 'intercambio, marketplace, compra, venta, comercio electrónico'
  },
  login: {
    title: 'Iniciar Sesión - Fleeswap',
    description: 'Inicia sesión en tu cuenta de Fleeswap para acceder a todas las funcionalidades.'
  },
  register: {
    title: 'Crear Cuenta - Fleeswap',
    description: 'Regístrate en Fleeswap y comienza a intercambiar de forma segura.'
  },
  profile: {
    title: 'Mi Perfil - Fleeswap',
    description: 'Gestiona tu perfil de usuario en Fleeswap.'
  },
  editProfile: {
    title: 'Editar Perfil - Fleeswap',
    description: 'Actualiza tu información personal en Fleeswap.'
  },
  completeProfile: {
    title: 'Completar Perfil - Fleeswap',
    description: 'Completa tu perfil para desbloquear todas las características de Fleeswap.'
  },
  forgotPassword: {
    title: 'Recuperar Contraseña - Fleeswap',
    description: 'Recupera tu contraseña de Fleeswap de forma segura.'
  },
  resetPassword: {
    title: 'Restablecer Contraseña - Fleeswap',
    description: 'Crea una nueva contraseña para tu cuenta de Fleeswap.'
  },
  changePassword: {
    title: 'Cambiar Contraseña - Fleeswap',
    description: 'Cambia la contraseña de tu cuenta de Fleeswap.'
  }
}

// Default SEO values
export const defaultSeo = {
  siteUrl: 'https://fleeswap.com',
  siteName: 'Fleeswap',
  image: process.env.VITE_FAVICON || '',
  locale: 'es_ES'
}

// Schema Structured Data
export const getSchema = (type, data = {}) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: defaultSeo.siteName,
    url: defaultSeo.siteUrl,
    image: defaultSeo.image,
    ...data
  }
  return baseSchema
}

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fleeswap',
  url: 'https://fleeswap.com',
  logo: process.env.VITE_FAVICON || '',
  description: 'Plataforma de intercambio seguro y confiable',
  sameAs: []
}
