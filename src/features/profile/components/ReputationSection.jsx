import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
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

  const { totalCompletados = 0, reseñas = [] } = reputacion

  // Empty State
  if (totalCompletados === 0 && reseñas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
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
