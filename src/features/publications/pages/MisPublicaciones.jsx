import { useState, useEffect } from 'react'
import useAuthStore from '../../../store/authStore'
import { getMyPublications, deletePublication } from '../services/publicationService'
import PublicationCard from '../components/PublicationCard'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'
import { toast } from 'sonner'

export default function MisPublicaciones() {
  const { user: authUser } = useAuthStore()
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Fetch publicaciones
  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMyPublications()
      setPublications(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar publicaciones'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setConfirmDelete(id)
  }

  const handleConfirmDelete = async () => {
    try {
      await deletePublication(confirmDelete)
      setPublications((prev) => prev.filter((p) => p._id !== confirmDelete))
      toast.success('Publicación eliminada exitosamente')
      setConfirmDelete(null)
    } catch (err) {
      const message = err.response?.data?.message || 'Error al eliminar publicación'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F4] to-slate-50">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Mis Publicaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona todas tus publicaciones</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Skeleton loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded flex-1" />
                    <div className="h-6 bg-gray-200 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tienes publicaciones disponibles</h3>
            <p className="text-gray-500 mt-2">Comienza a crear publicaciones para vender o intercambiar</p>
          </div>
        ) : (
          // Grid de publicaciones
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publications.map((publication) => (
              <PublicationCard
                key={publication._id}
                publication={publication}
                isOwner={true}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar publicación?"
          message="Esta acción no se puede deshacer. ¿Estás seguro?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
