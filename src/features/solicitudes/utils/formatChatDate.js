/**
 * formatChatDate.js
 * Helper para formatear timestamps de mensajes de chat.
 * Convierte un string ISO en "Hoy, 15:30" / "Ayer, 10:15" / "12 may, 09:00".
 */

export function formatChatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()

  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) return `Hoy, ${time}`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isYesterday) return `Ayer, ${time}`

  const dayStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
  return `${dayStr}, ${time}`
}
