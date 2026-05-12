export default function ProductMini({ photo, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
        {photo
          ? <img src={photo} alt={title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          : <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        }
      </div>
      <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{title ?? '—'}</p>
    </div>
  )
}
