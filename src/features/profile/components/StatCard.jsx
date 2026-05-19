export function StatCard({ value, label, badge }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[80px]">
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className="text-[10px] font-light text-slate-500 whitespace-nowrap">{label}</span>
      {badge && (
        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5">
          Próximamente
        </span>
      )}
    </div>
  )
}
