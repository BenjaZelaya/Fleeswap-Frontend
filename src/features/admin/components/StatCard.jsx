import SkeletonCard from '../../../shared/components/ui/SkeletonCard'

// tarjeta de estadísticas que muestra un título, un valor numérico, un ícono y un fondo de color. Si la propiedad `loading` es verdadera, muestra un componente de esqueleto (SkeletonCard) en lugar del contenido real.

export default function StatCard({ title, value, loading, icon, bgColor }) {
  if (loading) {
    return <SkeletonCard className="h-32 rounded-2xl w-full border border-slate-100 shadow-sm" />
  }

  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${bgColor.replace('bg-', 'bg-')}`} />

      <div className="flex items-center justify-between z-10">
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="z-10">
        <p className="text-2xl font-bold tracking-tight">{value || 0}</p>
        <p className="text-sm font-medium text-slate-500 mt-0.5">{title}</p>
      </div>
    </div>
  )
}
