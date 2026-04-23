export default function RadioGroup({ label, name, value, onChange, options = [], error, required = false }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-dark-warm">
        {label}
        {required && <span className="text-brand">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center cursor-pointer p-3 rounded-lg border-2 border-gray-200 hover:border-brand-light transition" htmlFor={`${name}-${opt.value}`}>
            <input
              type="radio"
              id={`${name}-${opt.value}`}
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="w-4 h-4 accent-brand cursor-pointer"
            />
            <span className="ml-3 font-medium text-dark-warm">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
