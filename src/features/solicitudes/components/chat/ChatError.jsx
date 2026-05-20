// ─── ChatError.jsx ─────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'

export default function ChatError({ message, onRetry, retrying }) {
  const navigate = useNavigate()
  const isPermission = /permiso|acceso|autorizado|no está activo/i.test(message ?? '')

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm ${isPermission ? 'bg-red-50' : 'bg-amber-50'}`}>
        {isPermission ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-slate-800 font-bold text-lg tracking-tight">
          {isPermission ? 'Acceso denegado' : 'No se pudo cargar el chat'}
        </p>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{message}</p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-[220px]">
        {!isPermission && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center justify-center gap-2 bg-brand text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-light transition-all text-sm active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {retrying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Reintentando...
              </>
            ) : 'Reintentar'}
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-slate-400 hover:text-brand transition-colors py-1.5"
        >
          ← Volver atrás
        </button>
      </div>
    </div>
  )
}
