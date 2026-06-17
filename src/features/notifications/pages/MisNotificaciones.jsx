import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import useNotificationStore from '../store/notificationStore'
import Seo from '../../../shared/components/Seo'

/* ── Iconos por tipo de notificación ────────────────────────────────────── */
const TYPE_CONFIG = {
  active_search_match: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    label: 'Coincidencia',
  },
  exchange_request_received: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Solicitud recibida',
  },
  exchange_request_accepted: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    label: 'Solicitud aceptada',
  },
  exchange_request_rejected: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-red-400',
    bg: 'bg-red-50',
    label: 'Solicitud rechazada',
  },
}

const DEFAULT_CONFIG = {
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  color: 'text-slate-400',
  bg: 'bg-slate-100',
  label: 'Notificación',
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRedirectPath(notification) {
  switch (notification.type) {
    case 'active_search_match':
      return `/publications/${notification.publication}`
    case 'exchange_request_received':
      return '/solicitudes-recibidas'
    case 'exchange_request_accepted':
      return notification.exchange ? `/chats/${notification.exchange}` : '/solicitudes-enviadas'
    case 'exchange_request_rejected':
      return '/solicitudes-enviadas'
    default:
      return notification.publication ? `/publications/${notification.publication}` : '/'
  }
}

/* ── Componente de Ítem individual ──────────────────────────────────────── */
function NotificationRow({ notification, onClick }) {
  const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG

  return (
    <motion.button
      layout
      onClick={() => onClick(notification)}
      className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-colors duration-300 cursor-pointer border-b border-slate-50 last:border-0 ${notification.isRead
          ? 'bg-white hover:bg-slate-50/60'
          : 'bg-brand/3 hover:bg-brand/6'
        }`}
    >
      {/* Indicador de no leída */}
      <div className="pt-4 shrink-0 w-2.5 flex justify-center">
        <AnimatePresence>
          {!notification.isRead && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="block w-2 h-2 rounded-full bg-brand-accent"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Icono por tipo o foto */}
      {notification.metadata?.publicationPhoto ? (
        <img
          src={notification.metadata.publicationPhoto}
          alt=""
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
        />
      ) : (
        <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <span className={config.color}>{config.icon}</span>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${config.bg} ${config.color} border-current/10`}>
                {config.label}
              </span>
            </div>
            <p className={`text-sm leading-snug ${notification.isRead ? 'text-slate-700' : 'text-slate-900 font-semibold'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 pt-5 whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>
    </motion.button>
  )
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 animate-pulse border-b border-slate-50">
      <div className="w-2.5 shrink-0" />
      <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}

/* ── Página principal ──────────────────────────────────────────────────── */
export default function MisNotificaciones() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    loadMore,
    markOneAsRead,
    markAllRead,
  } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  function handleClick(notification) {
    if (!notification.isRead) {
      markOneAsRead(notification._id)
    }
    const path = getRedirectPath(notification)
    navigate(path)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ backgroundColor: '#F9F7F4' }}
    >
      <Seo page="notifications" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mis Notificaciones
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : 'Todas leídas'}
            </p>
          </div>

          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={markAllRead}
              className="text-xs font-semibold text-brand-accent hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-brand/5"
            >
              Marcar todas como leídas
            </motion.button>
          )}
        </div>

        {/* ── Lista de notificaciones ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Loading inicial */}
          {loading && notifications.length === 0 && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {/* Estado vacío */}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-600 mb-1">
                No tenés notificaciones
              </h3>
              <p className="text-sm text-slate-400 max-w-xs">
                ¡Explorá publicaciones o creá nuevas búsquedas activas para recibir alertas cuando aparezca lo que buscás!
              </p>
            </div>
          )}

          {/* Lista */}
          {notifications.map((n) => (
            <NotificationRow
              key={n._id}
              notification={n}
              onClick={handleClick}
            />
          ))}

          {/* Cargar más */}
          {hasMore && notifications.length > 0 && (
            <div className="py-4 flex justify-center border-t border-slate-50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={loadMore}
                disabled={loading}
                className="text-xs font-semibold text-brand-accent hover:text-brand transition-colors px-4 py-2 rounded-lg hover:bg-brand/5 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-brand rounded-full animate-spin" />
                    Cargando...
                  </span>
                ) : (
                  'Cargar más'
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
