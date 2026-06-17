function formatRelativeTime(dateStr) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`

  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function NotificationItem({ notification, onSelect }) {
  const { title, message, metadata, isRead, createdAt } = notification

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
        !isRead ? 'bg-brand/5 hover:bg-brand/10' : 'bg-white hover:bg-slate-100'
      }`}
    >
      {/* Unread dot */}
      <div className="pt-3.5 shrink-0 w-2">
        {!isRead && (
          <span className="block w-2 h-2 rounded-full bg-brand-accent" />
        )}
      </div>

      {/* Photo or default icon */}
      {metadata?.publicationPhoto ? (
        <img
          src={metadata.publicationPhoto}
          alt={metadata.publicationTitle || ''}
          className="w-10 h-10 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-[11px] text-slate-400 line-clamp-1">{message}</p>
      </div>

      {/* Relative time */}
      <span className="text-[10px] text-slate-400 shrink-0 pt-0.5">
        {formatRelativeTime(createdAt)}
      </span>
    </button>
  )
}
