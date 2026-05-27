import { StatCard } from './StatCard'

export default function EstadisticasPerfil({ profile }) {
  if (!profile) return null

  const completados = profile.intercambiosCompletados ?? profile.successfulExchanges ?? 0
  const compras = profile.comprasCompletadas ?? 0
  const ventas = profile.ventasCompletadas ?? 0

  return (
    <div className="space-y-4 w-full sm:max-w-md">
      {/* Rating Pill */}
      <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs font-bold text-yellow-700">
          {(profile.calificacionPromedio ?? profile.averageRating ?? 0) > 0
            ? (profile.calificacionPromedio ?? profile.averageRating ?? 0).toFixed(1)
            : '4.5'} {/* Default placeholder if no rating */}
        </span>
        <span className="text-[10px] text-yellow-600/70 font-medium">Calificación</span>
      </div>

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
