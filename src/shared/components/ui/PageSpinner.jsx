export default function PageSpinner({ label = 'Cargando contenido' }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-[40vh] items-center justify-center"
    >
      <svg
        aria-hidden="true"
        className="h-8 w-8 animate-spin text-brand-accent"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )
}
