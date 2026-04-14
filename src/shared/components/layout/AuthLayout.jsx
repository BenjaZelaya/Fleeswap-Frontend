export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-blue-600 mb-1">Fleeswap</h1>
        {title && (
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-1">{title}</h2>
        )}
        {subtitle && (
          <p className="text-center text-sm text-gray-400 mb-8">{subtitle}</p>
        )}
        {children}
      </div>
      <p className="text-xs text-gray-300 mt-6 uppercase tracking-widest">
        © {new Date().getFullYear()} Fleeswap — El archivo digital de tu nostalgia.
      </p>
    </div>
  )
}
