import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../../store/authStore'
import { getMyPublications, deletePublication, updatePublicationStatus } from '../services/publicationService'
import { toast } from 'sonner'

export default function MisPublicaciones() {
  const { user: authUser } = useAuthStore()
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [statusChange, setStatusChange] = useState(null)

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

  const handleDeleteClick = (pub) => {
    // Verificar si hay intercambios en curso
    if (pub.status === 'en_intercambio' || pub.hasActiveExchange) {
      toast.error('No puedes eliminar una publicación con un intercambio en curso')
      return
    }

    // Si llegamos aquí, podemos eliminar (ya están filtradas por usuario)
    setConfirmDelete(pub._id)
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

  const handleToggleAvailability = (pub) => {
    // El backend usa 'available' y 'unavailable', pero internamente usamos 'disponible' y 'no_disponible'
    const backendStatus = pub.status || 'available'
    const isCurrentlyAvailable = backendStatus === 'available'
    const newStatus = isCurrentlyAvailable ? 'no_disponible' : 'disponible'
    setStatusChange({ 
      id: pub._id, 
      newStatus, 
      title: pub.title
    })
  }

  const handleConfirmStatusChange = async () => {
    if (!statusChange) return

    try {
      // Enviar directamente con el nuevo status (la función service lo convierte)
      const updatedPub = await updatePublicationStatus(statusChange.id, statusChange.newStatus)
      
      // Actualizar el estado local
      setPublications((prev) =>
        prev.map((p) => (p._id === statusChange.id ? { 
          ...p, 
          status: statusChange.newStatus === 'no_disponible' ? 'unavailable' : 'available'
        } : p))
      )
      
      const message = statusChange.newStatus === 'no_disponible' 
        ? 'Publicación marcada como no disponible'
        : 'Publicación marcada como disponible'
      toast.success(message)
      setStatusChange(null)
    } catch (err) {
      console.error('Error al cambiar estado:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      })
      
      const message = err.response?.data?.message || 'Error al cambiar el estado'
      toast.error(message)
    }
  }

  // Calcular estadísticas
  const totalArticles = publications.length
  const activeExchanges = publications.filter(p => p.type === 'trueque' || p.type === 'ambos').length
  const rating = 4.9

  // Mapear tipo de publicación a etiqueta
  const getTypeLabel = (type) => {
    const typeMap = {
      venta: 'ACTIVO',
      trueque: 'ACTIVO',
      ambos: 'ACTIVO',
    }
    return typeMap[type] || 'ACTIVO'
  }

  // Mapear tipo a color de badge
  const getTypeColor = (type) => {
    const typeMap = {
      venta: 'bg-blue-100 text-blue-800',
      trueque: 'bg-green-100 text-green-800',
      ambos: 'bg-purple-100 text-purple-800',
    }
    return typeMap[type] || 'bg-blue-100 text-blue-800'
  }

  // Obtener etiqueta y color del estado
  const getStatusLabel = (status) => {
    // Mapear tanto valores en inglés como en español
    const statusMap = {
      disponible: { label: 'ACTIVO', color: 'bg-green-100 text-green-800' },
      no_disponible: { label: 'NO DISPONIBLE', color: 'bg-gray-100 text-gray-800' },
      en_intercambio: { label: 'EN INTERCAMBIO', color: 'bg-yellow-100 text-yellow-800' },
      available: { label: 'ACTIVO', color: 'bg-green-100 text-green-800' },
      unavailable: { label: 'NO DISPONIBLE', color: 'bg-gray-100 text-gray-800' },
    }
    return statusMap[status] || { label: 'ACTIVO', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {/* Header con navegación */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mis publicaciones</h1>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Gestiona tu catálogo personal de nostalgia. Aquí puedes editar detalles o retirar artículos de la vista pública.
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total artículos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalArticles}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Intercambios activos</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeExchanges}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Calificación</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{rating} <span className="text-red-500">★</span></p>
          </div>
        </div>
      </div>

      {/* Tabla de publicaciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <p className="text-gray-600 mt-4">Cargando publicaciones...</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
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
            <p className="text-gray-600 mt-2">Comienza a crear publicaciones para vender o intercambiar</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ARTÍCULO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ESTADO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">VALOR EST.</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {publications.map((pub) => (
                  <tr key={pub._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pub.photos && pub.photos[0] && (
                          <img
                            src={pub.photos[0]}
                            alt={pub.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{pub.title}</p>
                          <p className="text-sm text-gray-600">{pub.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusLabel(pub.status || 'disponible').color}`}>
                        {getStatusLabel(pub.status || 'disponible').label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pub.price ? (
                        <p className="font-semibold text-gray-900">{pub.price.toLocaleString('es-AR')} €</p>
                      ) : (
                        <p className="text-gray-500">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/publications/${pub._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleToggleAvailability(pub)}
                          className={`p-2 rounded-lg transition-colors ${
                            (pub.status === 'no_disponible' || pub.status === 'unavailable')
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={(pub.status === 'no_disponible' || pub.status === 'unavailable') ? 'Marcar como disponible' : 'Marcar como no disponible'}
                        >
                          {(pub.status === 'no_disponible' || pub.status === 'unavailable') ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h8m-8-6h8M13 19h8M5 13a2 2 0 11-4 0 2 2 0 014 0zM5 7a2 2 0 11-4 0 2 2 0 014 0zM5 19a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pub)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación simple */}
            {publications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                <p>Mostrando {publications.length} de {totalArticles} publicaciones</p>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50" disabled>
                    ‹
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" disabled>
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in">
            {/* Icono de advertencia */}
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Título y mensaje */}
            <h3 className="text-lg font-bold text-gray-900 text-center">¿Eliminar publicación?</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Esta acción no se puede deshacer. La publicación será eliminada de la plataforma de forma permanente.
            </p>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de disponibilidad */}
      {statusChange && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in">
            {/* Icono de info */}
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Título y mensaje */}
            <h3 className="text-lg font-bold text-gray-900 text-center">
              {statusChange.newStatus === 'no_disponible' 
                ? '¿Marcar como no disponible?' 
                : '¿Marcar como disponible?'}
            </h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              {statusChange.newStatus === 'no_disponible' 
                ? 'Tu publicación no aparecerá en los listados activos, pero permanecerá en tu historial.'
                : 'Tu publicación vuelva a ser visible para otros usuarios.'}
            </p>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStatusChange(null)}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
