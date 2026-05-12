// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ESTADOS } from '../utils/constants'

export default function EmptyState({ filtro }) {
  const label = ESTADOS.find((e) => e.value === filtro)?.label?.toLowerCase() ?? filtro
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
      <p className="text-slate-700 font-semibold">{filtro === 'all' ? 'Aún no tenés solicitudes en esta sección.' : `No tenés solicitudes ${label}.`}</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">Explorá publicaciones y enviá tu primera propuesta, o esperá a que otros te envíen la suya.</p>
      <Link to="/explore" className="mt-6 text-sm font-semibold text-white bg-brand hover:bg-brand-light px-5 py-2.5 rounded-xl transition-colors">
        Explorar publicaciones
      </Link>
    </motion.div>
  )
}
