const DEFAULT_API_URL = 'http://localhost:3000/api'
const DEFAULT_SOCKET_URL = 'http://localhost:3000'
const API_SUFFIX_REGEX = /\/api\/?$/

function getBrowserOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return ''
}

function normalizeBaseUrl(url) {
  return typeof url === 'string' ? url.trim().replace(/\/+$/, '') : ''
}

export function getApiBaseUrl() {
  const apiUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL)
  return apiUrl || DEFAULT_API_URL
}

export function getSocketBaseUrl() {
  const explicitSocketUrl = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL)

  if (explicitSocketUrl) {
    if (explicitSocketUrl.startsWith('/')) {
      return getBrowserOrigin() || DEFAULT_SOCKET_URL
    }

    return explicitSocketUrl
  }

  const apiUrl = getApiBaseUrl()

  if (apiUrl.startsWith('/')) {
    return getBrowserOrigin() || DEFAULT_SOCKET_URL
  }

  if (API_SUFFIX_REGEX.test(apiUrl)) {
    return apiUrl.replace(API_SUFFIX_REGEX, '') || DEFAULT_SOCKET_URL
  }

  return apiUrl || DEFAULT_SOCKET_URL
}
