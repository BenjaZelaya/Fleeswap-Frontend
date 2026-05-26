import { Link, useLocation } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 pt-15 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado General */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Header Tabs */}
        <div className="mb-8 border-b border-slate-200 flex gap-6 overflow-x-auto hide-scrollbar">
          <Link
            to="/admin/dashboard"
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${location.pathname === '/admin/dashboard'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Publicaciones
          </Link>
          <Link
            to="/admin/usuarios"
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${location.pathname === '/admin/usuarios'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Usuarios
          </Link>
          <Link
            to="/admin/reportes"
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${location.pathname === '/admin/reportes'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
          >
            Reportes
          </Link>
        </div>

        {/* Contenido Principal con Animación */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
