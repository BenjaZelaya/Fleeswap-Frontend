import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { PUBLICATION_CATEGORIES } from '../../../shared/utils/constants'

function TypeBadge({ type }) {
  if (type === 'trueque')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-accent bg-brand-accent/10 px-2.5 py-0.5 rounded-full">
        ⇄ Intercambio
      </span>
    )
  if (type === 'venta')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
        $ Venta
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
      ⇄ / $ Ambos
    </span>
  )
}

function getCategoryLabel(category) {
  const cat = PUBLICATION_CATEGORIES?.find((c) => c.value === category)
  return cat?.label || category
}

export default function CarouselPublicationCard({ pub, compact = false, onIntercambiar, onComprar, isBuying }) {
  const ownerInitial = pub.owner?.nombre?.[0]?.toUpperCase() ?? '?'
  const ownerName = [pub.owner?.nombre, pub.owner?.apellido].filter(Boolean).join(' ')

  return (
    <Link to={`/publications/${pub._id}`}>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full"
      >
        {/* Foto */}
        <div className="relative bg-slate-100 overflow-hidden aspect-4/3">
          {pub.photos?.[0] ? (
            <img
              src={pub.photos[0]}
              alt={pub.title}
              className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Categoría */}
          <div className="absolute top-2.5 right-2.5 bg-brand/80 backdrop-blur-sm text-white text-[9px] font-light uppercase tracking-wider px-2 py-0.5 rounded-full">
            {getCategoryLabel(pub.category)}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm leading-snug truncate">{pub.title}</p>
            {!compact && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pub.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              {pub.owner?.photo ? (
                <img src={pub.owner.photo} alt={ownerName} className="w-5 h-5 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {ownerInitial}
                </div>
              )}
              <span className="text-[10px] font-light text-slate-400">{pub.location || pub.owner?.location || ''}</span>
            </div>
          </div>

          {/* Precio + tipo */}
          <div className="flex items-center justify-between gap-2">
            {(pub.type === 'venta' || pub.type === 'ambos') && pub.price ? (
              <span className="font-bold text-slate-900 text-base">
                ${pub.price.toLocaleString('es-AR')}
              </span>
            ) : null}
            <TypeBadge type={pub.type} />
          </div>

          {/* Botones de acción */}
          {!compact && (
            <div
              className="flex gap-2 pt-1"
              onClick={(e) => e.preventDefault()}
            >
              {(pub.type === 'trueque' || pub.type === 'ambos') && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onIntercambiar?.(pub)
                  }}
                  className="flex-1 bg-brand text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-light transition-colors cursor-pointer"
                >
                  Intercambiar
                </button>
              )}
              {(pub.type === 'venta' || pub.type === 'ambos') && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onComprar?.(pub); }}
                  disabled={isBuying}
                  className="flex-1 bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isBuying ? 'Enviando...' : 'Comprar'}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
