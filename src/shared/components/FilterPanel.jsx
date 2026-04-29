import { PUBLICATION_CATEGORIES, PUBLICATION_CONDITIONS } from '../../utils/constants'

const TYPE_OPTIONS = [
  { value: 'ambos', label: 'Ambos' },
  { value: 'venta', label: 'Venta' },
  { value: 'trueque', label: 'Trueque' },
]

export default function FilterPanel({
  filters,
  onChange,
  onClear,
  className = '',
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Filtrar resultados</p>
          <p className="text-xs text-slate-500">Ajusta la busqueda segun lo que te interesa.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-5 divide-y divide-slate-100">
        <div className="space-y-2 pb-4">
          <label
            htmlFor="filter-category"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Categoria
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(event) => onChange('category', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand"
          >
            <option value="">Todas</option>
            {PUBLICATION_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 py-4">
          <label
            htmlFor="filter-condition"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Condicion
          </label>
          <select
            id="filter-condition"
            value={filters.condition}
            onChange={(event) => onChange('condition', event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand"
          >
            <option value="">Cualquiera</option>
            {PUBLICATION_CONDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 py-4">
          <label
            htmlFor="filter-max-price"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Precio maximo
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            inputMode="numeric"
            value={filters.maxPrice}
            onChange={(event) => onChange('maxPrice', event.target.value)}
            placeholder="Ej: 50000"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand"
          />
        </div>

        <div className="space-y-2 pt-4">
          <span
            id="filter-type-label"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Tipo
          </span>
          <div className="grid grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((option) => {
              const active = filters.type === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange('type', option.value)}
                  aria-pressed={active}
                  aria-describedby="filter-type-label"
                  className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                    active
                      ? 'border-brand bg-brand text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
