import { Link, useLocation } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import Seo from '../shared/components/Seo'

export default function NotFound() {
  const location = useLocation()

  return (
    <>
      <Seo
        title="Página no encontrada · Fleeswap"
        description="La ruta que buscás no existe en Fleeswap."
      />

      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          {/* Número grande decorativo */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-[9rem] font-extrabold leading-none tracking-tighter text-slate-100 select-none"
          >
            404
          </motion.p>

          {/* Ícono */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center mx-auto -mt-6 mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-brand-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Página no encontrada
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-1">
              La ruta{' '}
              <code className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {location.pathname}
              </code>{' '}
              no existe en Fleeswap.
            </p>
            <p className="text-sm text-slate-400">
              Puede que el enlace esté roto o que la publicación haya sido eliminada.
            </p>
          </motion.div>

          {/* Acciones */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir al inicio
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand/40 hover:bg-brand/5 text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              Explorar publicaciones
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
