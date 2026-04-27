import { Link } from 'react-router-dom'
import { PUBLICATION_TYPES, PUBLICATION_CONDITIONS } from '../../../utils/constants'

export default function PublicationCard({ publication, isOwner, onEdit, onDelete }) {
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

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden hover:border-brand/20 transition-colors hover:shadow-sm">
      {/* Foto */}
      {publication.photos?.[0] && (
        <img
          src={publication.photos[0]}
          alt={publication.title}
          className="w-full h-40 object-cover"
        />
      )}

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <p className="text-sm font-medium text-gray-800 truncate">{publication.title}</p>

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
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Link
              to={`/publications/${publication._id}/edit`}
              className="flex-1 py-2 px-3 text-sm font-medium text-brand bg-brand/5 rounded-lg hover:bg-brand/10 transition-colors text-center"
            >
              Editar
            </Link>
            <button
              onClick={() => onDelete(publication._id)}
              className="flex-1 py-2 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
