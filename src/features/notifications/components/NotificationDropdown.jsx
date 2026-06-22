// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import useNotificationStore from '../store/notificationStore'
import NotificationItem from './NotificationItem'

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { notifications, unreadCount, markOneAsRead, markAllRead, loading } =
    useNotificationStore()

  const handleSelect = async (notification) => {
    if (!notification.isRead) {
      markOneAsRead(notification._id)
    }
    navigate(`/mis-intercambios`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 sm:right-0 top-full mt-2 w-70 sm:w-85 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 origin-top-right"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] font-semibold text-brand-accent hover:text-brand transition-colors cursor-pointer"
              >
                Marcar todas
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-brand rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">No tenés notificaciones</p>
              </div>
            ) : (
              notifications.slice(0, 1).map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>

          {/* Footer: Ver todas */}
          {notifications.length > 0 && (
            <Link
              to="/mis-notificaciones"
              onClick={onClose}
              className="block text-center px-4 py-2.5 text-xs font-semibold text-brand-accent hover:text-brand hover:bg-slate-100 transition-colors border-t border-slate-100"
            >
              Ver todas las notificaciones
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
