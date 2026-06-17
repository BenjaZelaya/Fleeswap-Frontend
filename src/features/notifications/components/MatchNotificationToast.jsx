import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function MatchNotificationToast({ notification, onClose }) {
  const { title, message, publication, metadata } = notification

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50 }}
      className="relative flex gap-3 max-w-sm bg-white rounded-2xl shadow-lg border border-slate-100 p-3"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left: photo or icon */}
      {metadata?.publicationPhoto ? (
        <img
          src={metadata.publicationPhoto}
          alt={metadata.publicationTitle || ''}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      )}

      {/* Center: text content */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{message}</p>

        {publication && (
          <Link
            to={`/publications/${publication}`}
            className="inline-block mt-1.5 text-xs font-semibold text-brand-accent hover:text-brand transition-colors"
          >
            Ver publicación →
          </Link>
        )}
      </div>
    </motion.div>
  )
}
