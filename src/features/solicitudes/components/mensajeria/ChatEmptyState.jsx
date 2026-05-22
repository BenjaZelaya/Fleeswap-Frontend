export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700 text-sm">Seleccioná un chat para comenzar</p>
        <p className="text-xs text-slate-400 mt-1">Tus conversaciones de intercambio aparecerán aquí</p>
      </div>
    </div>
  )
}
