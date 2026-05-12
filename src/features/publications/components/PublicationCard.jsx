import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { PUBLICATION_TYPES, PUBLICATION_CONDITIONS } from '../../../utils/constants'

export default function PublicationCard({ publication, isOwner, onDelete }) {
  if (!publication) return null

  // Mapear enum values a labels
  const getTypeLabel = (type) => {
    const typeObj = PUBLICATION_TYPES.find((t) => t.value === type)
    return typeObj?.label || type
  }

  const getConditionLabel = (condition) => {
    const condObj = PUBLICATION_CONDITIONS.find((c) => c.value === condition)
    return condObj?.label || condition
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isUnavailable = publication.status === 'unavailable' || publication.status === 'pausado'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 25,
        mass: 1
      }}
      className={isUnavailable ? 'opacity-60 grayscale-[0.5]' : ''}
    >
      <Link to={`/publications/${publication._id}`} className="rounded-xl border border-gray-100 overflow-hidden hover:border-brand/20 transition-all hover:shadow-md hover:cursor-pointer block h-full bg-white relative">
        {isUnavailable && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-slate-800/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              Pausada
            </span>
          </div>
        )}
        {/* Foto */}
        <div className="relative bg-slate-100 overflow-hidden aspect-4/3">
          {publication.photos?.[0] ? (
            <img
              src={publication.photos[0]}
              alt={publication.title}
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
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          {/* Título */}
          <p className="text-sm font-medium text-gray-800 truncate hover:text-brand transition-colors">{publication.title}</p>

          {/* Precio */}
          {publication.price && (
            <p className="text-lg font-semibold text-brand">${publication.price.toLocaleString()}</p>
          )}

          {/* Condición y Tipo */}
          <div className="flex gap-2 flex-wrap">
            {publication.condition && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                {getConditionLabel(publication.condition)}
              </span>
            )}
            <span className="text-xs bg-brand/10 text-brand px-2.5 py-1 rounded-full capitalize">
              {getTypeLabel(publication.type)}
            </span>
          </div>

          {/* Fecha */}
          <p className="text-xs text-gray-400">{formatDate(publication.createdAt)}</p>

          {/* Botones (solo si es dueño) */}
          {isOwner && (
            <div className="flex gap-2 pt-2 border-t border-gray-100" onClick={(e) => e.preventDefault()}>
              <Link
                to={`/publications/${publication._id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-2 px-3 text-sm font-medium text-brand bg-brand/5 rounded-lg hover:bg-brand/10 transition-colors text-center"
              >
                Editar
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(publication._id)
                }}
                className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
