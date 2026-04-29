import { Search } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar publicaciones',
  buttonLabel = 'Buscar',
  className = '',
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center ${className}`}
    >
      <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-light"
      >
        {buttonLabel}
      </button>
    </form>
  )
}
