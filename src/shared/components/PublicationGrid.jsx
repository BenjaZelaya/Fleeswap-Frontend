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
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (publications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold text-slate-900">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div>
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
        {publications.map((publication) => (
          <PublicationCard key={publication._id} publication={publication} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
