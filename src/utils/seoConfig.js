export const seoConfig = {
  home: {
    title: 'Fleeswap - Intercambia y compra objetos con historia',
    description: 'Compra, vende e intercambia objetos con historia en una comunidad simple, directa y segura.',
    keywords: 'intercambio, marketplace, compra, venta, segunda mano'
  },
  explore: {
    title: 'Explorar publicaciones - Fleeswap',
    description: 'Explora publicaciones por categoria, estado y modalidad para encontrar objetos con historia.'
  },
  login: {
    title: 'Iniciar sesion - Fleeswap',
    description: 'Inicia sesion en tu cuenta de Fleeswap para acceder a todas las funcionalidades.'
  },
  register: {
    title: 'Crear cuenta - Fleeswap',
    description: 'Registrate en Fleeswap y comenza a intercambiar de forma segura.'
  },
  profile: {
    title: 'Mi perfil - Fleeswap',
    description: 'Gestiona tu perfil de usuario en Fleeswap.'
  },
  editProfile: {
    title: 'Editar perfil - Fleeswap',
    description: 'Actualiza tu informacion personal en Fleeswap.'
  },
  completeProfile: {
    title: 'Completar perfil - Fleeswap',
    description: 'Completa tu perfil para desbloquear todas las caracteristicas de Fleeswap.'
  },
  forgotPassword: {
    title: 'Recuperar contrasena - Fleeswap',
    description: 'Recupera tu contrasena de Fleeswap de forma segura.'
  },
  resetPassword: {
    title: 'Restablecer contrasena - Fleeswap',
    description: 'Crea una nueva contrasena para tu cuenta de Fleeswap.'
  },
  changePassword: {
    title: 'Cambiar contrasena - Fleeswap',
    description: 'Cambia la contrasena de tu cuenta de Fleeswap.'
  }
}

export const defaultSeo = {
  siteUrl: 'https://fleeswap.com',
  siteName: 'Fleeswap',
  image: 'https://fleeswap.com/og-image.svg',
  locale: 'es_ES'
}

export const getSchema = (type, data = {}) => {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: defaultSeo.siteName,
    url: defaultSeo.siteUrl,
    image: defaultSeo.image,
    ...data
  }
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Fleeswap',
  url: 'https://fleeswap.com',
  logo: 'https://fleeswap.com/favicon.svg',
  description: 'Plataforma de intercambio seguro y confiable',
  sameAs: []
}
