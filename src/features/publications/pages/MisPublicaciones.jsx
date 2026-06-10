import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { getMyPublications, deletePublication, updatePublicationStatus } from '../services/publicationService'
import { toast } from 'sonner'
import ConfirmModal from '../../../shared/components/ui/ConfirmModal'

export default function MisPublicaciones() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [statusChange, setStatusChange] = useState(null)

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    try {
      setLoading(true)
      const data = await getMyPublications()
      setPublications(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar publicaciones'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (pub) => {
    if (pub.intercambioActivo) {
      toast.error('No podés eliminar una publicación con un intercambio en curso')
      return
    }
    if (pub.status === 'sold' || pub.status === 'exchanged') {
      toast.error('Las publicaciones vendidas o intercambiadas no pueden eliminarse')
      return
    }
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
      await updatePublicationStatus(statusChange.id, statusChange.newStatus)

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
  const activeExchanges = publications.filter(p => p.intercambioActivo === true).length
  const totalSold = publications.filter(p => p.status === 'sold').length
  const totalExchanged = publications.filter(p => p.status === 'exchanged').length

  // Determinar si una publicación es definitivamente final (no reversible)
  const isFinal = (pub) => pub.status === 'sold' || pub.status === 'exchanged'

  // Obtener etiqueta y color del estado
  const getStatusLabel = (pub) => {
    if (pub.status === 'suspended') return { label: 'BLOQUEADA', color: 'bg-red-100 text-red-700 border border-red-200' }
    if (pub.status === 'sold') return { label: 'VENDIDA', color: 'bg-purple-100 text-purple-800 border border-purple-200' }
    if (pub.status === 'exchanged') return { label: 'INTERCAMBIADA', color: 'bg-indigo-100 text-indigo-800 border border-indigo-200' }
    if (pub.intercambioActivo) return { label: 'EN PROCESO', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' }
    if (pub.status === 'unavailable' || pub.status === 'no_disponible') return { label: 'NO DISPONIBLE', color: 'bg-gray-100 text-gray-600 border border-gray-200' }
    return { label: 'ACTIVA', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-warm-white"
    >
      {/* Header con navegación */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis publicaciones</h1>
              <p className="text-slate-500 text-sm mt-1.5 hidden sm:block">
                Gestioná tu catálogo personal. Editá detalles o retirá artículos de la vista pública.
              </p>
            </div>
            <Link
              to="/publications/create"
              className="shrink-0 inline-flex items-center gap-2 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nueva publicación</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-2 sm:hidden">
            Gestioná tu catálogo personal.
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
            <p className="text-3xl font-bold text-slate-900 mt-1.5">{totalArticles}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">En proceso</p>
            <p className="text-3xl font-bold text-slate-900 mt-1.5">{activeExchanges}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Vendidas</p>
            <p className="text-3xl font-bold text-purple-700 mt-1.5">{totalSold}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Intercambiadas</p>
            <p className="text-3xl font-bold text-indigo-700 mt-1.5">{totalExchanged}</p>
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tenés publicaciones disponibles</h3>
            <p className="text-gray-600 mt-2">Comienza a crear publicaciones para vender o intercambiar</p>
          </div>
        ) : (
          <>
            {/* ── Móvil: tarjetas ──────────────────────────────────── */}
            <div className="block sm:hidden space-y-3">
              {publications.map((pub) => {
                const { label, color } = getStatusLabel(pub)
                const isUnavailable = pub.status === 'no_disponible' || pub.status === 'unavailable'
                return (
                  <div key={pub._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Fila superior: imagen + datos */}
                    <div className="flex gap-3 p-4">
                      {/* Thumbnail */}
                      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                        {pub.photos?.[0] ? (
                          <img src={pub.photos[0]} alt={pub.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Datos */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/publications/${pub._id}`}>
                          <p className="font-semibold text-slate-900 truncate leading-snug hover:text-brand-accent transition-colors">{pub.title}</p>
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{pub.category?.replace(/_/g, ' ')}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
                            {label}
                          </span>
                          {pub.price ? (
                            <span className="font-bold text-slate-900 text-sm">${pub.price.toLocaleString('es-AR')}</span>
                          ) : (
                            <span className="text-[11px] font-bold text-brand-accent">Solo intercambio</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de acciones */}
                    <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                      {pub.status === 'sold' ? (
                        <div className="flex-1 flex items-center justify-center p-3 text-[10px] sm:text-xs text-purple-700 font-bold bg-purple-50">
                          Vendida — sin acciones disponibles
                        </div>
                      ) : pub.status === 'exchanged' ? (
                        <div className="flex-1 flex items-center justify-center p-3 text-[10px] sm:text-xs text-indigo-700 font-bold bg-indigo-50">
                          Intercambiada — sin acciones disponibles
                        </div>
                      ) : pub.status === 'suspended' ? (
                        <div className="flex-1 flex items-center justify-center p-3 text-[10px] sm:text-xs text-red-600 font-semibold bg-red-50">
                          Bloqueada por moderación
                        </div>
                      ) : pub.intercambioActivo ? (
                        <div className="flex-1 flex items-center justify-center p-3 text-[10px] sm:text-xs text-yellow-700 font-semibold bg-yellow-50">
                          En proceso — acciones limitadas
                        </div>
                      ) : (
                        <>
                          <Link
                            to={`/publications/${pub._id}/edit`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggleAvailability(pub)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${isUnavailable
                                ? 'text-green-600 hover:bg-green-50 active:bg-green-100'
                                : 'text-orange-600 hover:bg-orange-50 active:bg-orange-100'
                              }`}
                          >
                            {isUnavailable ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {isUnavailable ? 'Activar' : 'Pausar'}
                          </button>
                        </>
                      )}
                      {!isFinal(pub) && (
                        <button
                          onClick={() => handleDeleteClick(pub)}
                          disabled={pub.intercambioActivo}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop: tabla ───────────────────────────────────── */}
            <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusLabel(pub).color}`}>
                          {getStatusLabel(pub).label}
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
                          {pub.status === 'sold' ? (
                            <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full">Vendida</span>
                          ) : pub.status === 'exchanged' ? (
                            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full">Intercambiada</span>
                          ) : pub.status === 'suspended' ? (
                            <span className="text-xs text-red-500 font-medium mr-2">Bloqueada</span>
                          ) : pub.intercambioActivo ? (
                            <span className="text-xs text-yellow-700 font-medium mr-2">En proceso</span>
                          ) : (
                            <>
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
                                className={`p-2 rounded-lg transition-colors ${(pub.status === 'no_disponible' || pub.status === 'unavailable')
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
                            </>
                          )}
                          {!isFinal(pub) && (
                            <button
                              onClick={() => handleDeleteClick(pub)}
                              disabled={pub.intercambioActivo}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
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
          </>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar publicación?"
        message="Esta acción no se puede deshacer. La publicación será eliminada de la plataforma de forma permanente."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal de cambio de disponibilidad */}
      <ConfirmModal
        open={!!statusChange}
        onClose={() => setStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        title={statusChange?.newStatus === 'no_disponible'
          ? '¿Marcar como no disponible?'
          : '¿Marcar como disponible?'}
        message={statusChange?.newStatus === 'no_disponible'
          ? 'Tu publicación no aparecerá en los listados activos, pero permanecerá en tu historial.'
          : 'Tu publicación volverá a ser visible para otros usuarios.'}
        confirmText="Confirmar"
      />
    </motion.div>
  )
}
