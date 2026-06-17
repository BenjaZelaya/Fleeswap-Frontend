export function logError(message, details) {
  if (import.meta.env.DEV) {
    console.error(message, details)
  }
}

export function logInfo(message, details) {
  if (import.meta.env.DEV) {
    console.log(message, details)
  }
}
