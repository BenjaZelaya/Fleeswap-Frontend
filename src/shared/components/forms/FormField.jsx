export default function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export const inputClass = (error) =>
  `w-full px-4 py-3 rounded-lg border bg-gray-50 text-sm outline-none transition ` +
  `focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ` +
  (error ? 'border-red-400 bg-red-50' : 'border-gray-200')
