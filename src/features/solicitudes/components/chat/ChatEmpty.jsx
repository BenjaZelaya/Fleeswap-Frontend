
export default function ChatEmpty({ chatEnabled }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center select-none">
      {/* Ilustración */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-brand/8 to-brand-accent/10 flex items-center justify-center shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 text-brand/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        </div>
        {chatEnabled && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-warm-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-ping absolute" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-slate-800 font-bold text-base tracking-tight">¡Rompan el hielo!</p>
        <p className="text-slate-400 text-sm max-w-60 leading-relaxed">
          {chatEnabled
            ? 'Escribí el primer mensaje y coordiná el trueque.'
            : 'Conectando al chat en tiempo real...'}
        </p>
      </div>

      {chatEnabled && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-widest">En línea</span>
        </div>
      )}
    </div>
  )
}
