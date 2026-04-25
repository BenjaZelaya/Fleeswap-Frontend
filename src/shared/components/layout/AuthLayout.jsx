import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'

const panelItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }
const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
}

export default function AuthLayout({ title, subtitle, children }) {
  const navigate = useNavigate()
  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen flex">

        {/* Panel izquierdo */}
        <div
          className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
          style={{ backgroundColor: '#1b365d' }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="absolute top-1/3 -left-16 w-64 h-64 bg-brand/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

          <motion.div
            variants={panelStagger}
            initial="hidden"
            animate="show"
            className="relative flex flex-col justify-between h-full"
          >
            {/* Marca */}
            <motion.div variants={panelItem} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl text-white tracking-tight">
                <span className="font-light">Flee</span><span className="font-extrabold">swap</span>
              </h1>
              <p className="text-[10px] font-light uppercase tracking-[0.22em] text-slate-500 mt-2">
                El archivo digital de tu nostalgia
              </p>
            </motion.div>

            {/* Quote */}
            <motion.div variants={panelItem} transition={{ duration: 0.5 }} className="space-y-5">
              <p className="text-[22px] font-light italic text-white/75 leading-relaxed">
                "Cada objeto guarda<br />una historia. Dale<br />una segunda vida."
              </p>
              <div className="flex gap-1.5">
                <span className="w-8 h-0.5 bg-brand-light rounded-full" />
                <span className="w-2 h-0.5 bg-slate-700 rounded-full" />
                <span className="w-2 h-0.5 bg-slate-700 rounded-full" />
              </div>
            </motion.div>

            {/* Footer */}
            <motion.p variants={panelItem} transition={{ duration: 0.4 }}
              className="text-[9px] font-light uppercase tracking-[0.25em] text-slate-600"
            >
              © {new Date().getFullYear()} Fleeswap
            </motion.p>
          </motion.div>
        </div>

        {/* Panel derecho */}
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 py-12"
          style={{ backgroundColor: '#F9F7F4' }}
        >
          {/* Botón volver */}
          <div className="w-full max-w-sm mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-light text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
          </div>

          {/* Mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl text-brand tracking-tight">
              <span className="font-light">Flee</span><span className="font-extrabold">swap</span>
            </h1>
            <p className="text-[10px] font-light uppercase tracking-[0.2em] text-slate-400 mt-1.5">
              El archivo digital de tu nostalgia
            </p>
          </div>

          {/* Tarjeta del formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-10"
          >
            {title && (
              <h2 className="text-2xl font-bold text-brand tracking-tight mb-1">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm font-light text-slate-400 mb-8 leading-relaxed">{subtitle}</p>
            )}
            {children}
          </motion.div>
        </div>

      </div>
    </>
  )
}
