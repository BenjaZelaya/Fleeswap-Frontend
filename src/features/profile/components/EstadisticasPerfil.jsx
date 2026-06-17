import { useState, useEffect } from 'react'
import { StatCard } from './StatCard'
import { getReputacionUsuario } from '../services/reputationService'
import StarRating from '../../ratings/components/StarRating'

export default function EstadisticasPerfil({ profile }) {
  const [ratingReal, setRatingReal] = useState(0)

  useEffect(() => {
    let active = true
    async function fetchReputation() {
      if (!profile) return
      try {
        const data = await getReputacionUsuario(profile._id || profile.id)
        if (active && data) {
          setRatingReal(data.ratingPromedio || 0)
        }
      } catch {
        // Fallback silencioso si falla
      }
    }
    
    if (profile?._id || profile?.id) {
      fetchReputation()
    }
    return () => { active = false }
  }, [profile?._id, profile?.id])

  if (!profile) return null

  const completados = profile.intercambiosCompletados ?? profile.successfulExchanges ?? 0
  const compras = profile.comprasCompletadas ?? 0
  const ventas = profile.ventasCompletadas ?? 0

  return (
    <div className="space-y-4 w-full sm:max-w-md">
      {/* Rating Pill Dinámico con StarRating */}
      {ratingReal > 0 ? (
        <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
          <span className="text-sm font-extrabold text-slate-800">
            {Number(ratingReal).toFixed(1)}
          </span>
          <StarRating rating={ratingReal} size={14} />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500">Nuevo usuario</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* Intercambios */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-brand/5 border border-brand/10 shadow-sm transition-all hover:bg-brand/10">
          <div className="mb-2 text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 leading-none">{completados}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1.5">Intercambios</span>
        </div>

        {/* Compras */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-brand/5 border border-brand/10 shadow-sm transition-all hover:bg-brand/10">
          <div className="mb-2 text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 leading-none">{compras}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1.5">Compras</span>
        </div>

        {/* Ventas */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-brand/5 border border-brand/10 shadow-sm transition-all hover:bg-brand/10">
          <div className="mb-2 text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 leading-none">{ventas}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1.5">Ventas</span>
        </div>
      </div>
    </div>
  )
}
