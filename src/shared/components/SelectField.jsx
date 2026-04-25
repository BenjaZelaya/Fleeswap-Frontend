export default function SelectField({ label, name, value, onChange, options = [], error, required = false }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-dark-warm">
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-light ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-red-300'
            : 'border-brand-light bg-white focus:border-brand focus:ring-brand-light/50'
        }`}
      >
        <option value="">-- Selecciona una opción --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
