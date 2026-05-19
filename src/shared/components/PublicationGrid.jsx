import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import PublicationCard from '../../features/publications/components/PublicationCard'
import SkeletonCard from './ui/SkeletonCard'

function Pagination({ page, totalPages, onPageChange }) {
  if (!onPageChange || totalPages <= 1) return null

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
      <p className="text-sm text-slate-500">
        Página <span className="font-semibold text-slate-900">{page}</span> de{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default function PublicationGrid({
  publications = [],
  loading = false,
  emptyTitle = 'No encontramos publicaciones',
  emptyDescription = 'Probá cambiando los filtros o revisá de nuevo más tarde.',
  showCreateButton = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  return (
    <div className="relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </motion.div>
        ) : publications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900">{emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{emptyDescription}</p>
            {showCreateButton && (
              <div className="mt-6">
                <Link
                  to="/publications/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-light active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Publicación
                </Link>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div layout className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
              <AnimatePresence mode="popLayout">
                {publications.map((publication) => (
                  <PublicationCard key={publication._id} publication={publication} />
                ))}
              </AnimatePresence>
            </motion.div>

            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
