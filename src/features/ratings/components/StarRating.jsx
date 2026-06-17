import { useId } from 'react'

export default function StarRating({ rating = 0, size = 16, className = '' }) {
  // Aseguramos que el rating esté entre 0 y 5
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0))
  const uniqueId = useId() // Para que el defs del SVG no choque si hay múltiples componentes

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`Calificación: ${safeRating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fillPercentage = Math.max(0, Math.min(100, (safeRating - index + 1) * 100))
        const gradientId = `star-grad-${uniqueId}-${index}`

        return (
          <div key={index} className="relative leading-none">
            {/* SVG customizado para permitir fill parcial */}
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={fillPercentage > 0 ? 'text-brand' : 'text-slate-200'}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fillPercentage}%`} stopColor="currentColor" />
                  <stop offset={`${fillPercentage}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={`url(#${gradientId})`}
                className={fillPercentage > 0 ? 'stroke-brand' : 'stroke-slate-200'}
              />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
