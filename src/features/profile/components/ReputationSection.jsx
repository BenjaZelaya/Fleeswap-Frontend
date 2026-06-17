import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getReputacionUsuario } from '../services/reputationService'
import StarRating from '../../ratings/components/StarRating'

export default function ReputationSection({ userId, isOwnProfile }) {
  const [reputacion, setReputacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleReviews, setVisibleReviews] = useState(5)

  useEffect(() => {
    let active = true
    async function fetchReputation() {
      setLoading(true)
      try {
        const data = await getReputacionUsuario(userId)
        if (active) setReputacion(data)
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Error al cargar reputación')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (userId) fetchReputation()
    return () => { active = false }
  }, [userId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <svg className="animate-spin h-8 w-8 text-brand" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  if (error || !reputacion) {
    return (
      <div className="text-center py-10 text-slate-500">
        <p>{error || 'No se pudo obtener la información.'}</p>
      </div>
    )
  }

  const { ratingPromedio = 0, totalCompletados = 0, totalCancelados = 0, reseñas = [] } = reputacion
  const promedioFormateado = Number(ratingPromedio).toFixed(1)

  // Empty State
  if (totalCompletados === 0 && reseñas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 mb-4 bg-slate-50 rounded-full flex items-center justify-center">
          <span className="text-4xl">🌱</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {isOwnProfile ? 'Aún no tenés calificaciones' : 'Este usuario es nuevo'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {isOwnProfile
            ? '¡Realizá tu primer trueque exitoso para empezar a construir tu reputación!'
            : 'Este usuario aún no tiene calificaciones en la comunidad. ¡Animáte a ser el primero en hacer un trueque con él!'}
        </p>
      </div>
    )
  }

  const handleLoadMore = () => {
    setVisibleReviews(prev => prev + 5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Panel de Estadísticas (Hero Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-slate-900 mb-2">{promedioFormateado}</span>
          <StarRating rating={ratingPromedio} size={20} />
          <span className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wider">Promedio</span>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-emerald-600 mb-2">{totalCompletados}</span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Trueques exitosos</span>
        </div>

        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-50 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-red-400 mb-2">{totalCancelados}</span>
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Cancelados</span>
        </div>
      </div>

      {/* Historial de Reseñas */}
      <div className="pt-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
          Historial de Reseñas ({reseñas.length})
        </h3>

        {reseñas.length > 0 ? (
          <div className="space-y-3">
            {reseñas.slice(0, visibleReviews).map((resena, idx) => (
              <div key={resena._id || resena.id || idx} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {resena.reviewerName || resena.reviewer?.nombre || 'Usuario eliminado'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {resena.createdAt ? new Date(resena.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <StarRating rating={resena.rating} size={14} className="shrink-0" />
                </div>

                {resena.comment ? (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                    {resena.comment}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    El usuario no dejó comentario.
                  </p>
                )}
              </div>
            ))}

            {visibleReviews < reseñas.length && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-full transition-colors"
                >
                  Cargar más reseñas
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-sm text-slate-500">Aún no hay reseñas escritas para este usuario.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
