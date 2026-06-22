import { Link } from 'react-router-dom'

export default function ExchangeProductMini({ pub, fallbackText }) {
  if (!pub) return <span className="text-xs text-slate-400 italic">{fallbackText}</span>

  const photo = pub.photos?.[0] || pub.photo
  const title = pub.title || pub.titulo

  return (
    <Link 
      to={`/publications/${pub._id || pub.id}`}
      className="flex items-center gap-3 bg-slate-50 hover:bg-brand/5 rounded-xl p-2 pr-4 border border-slate-100 hover:border-brand/20 transition-colors w-full group"
    >
      {photo ? (
        <img src={photo} alt={title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 border border-slate-200" />
      )}
      <span className="text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors line-clamp-1">{title}</span>
    </Link>
  )
}
