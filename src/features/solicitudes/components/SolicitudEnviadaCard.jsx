import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { BADGE, BADGE_LABEL, CARD_ACCENT, cardVariants } from '../utils/constants'
import ProductMini from './ProductMini'

export default function SolicitudEnviadaCard({ solicitud }) {
  const { owner, offeredPublication, requestedPublication, status, complementaryAmount, createdAt } = solicitud
  const initial = owner?.nombre?.[0]?.toUpperCase() ?? '?'
  const name = [owner?.nombre, owner?.apellido].filter(Boolean).join(' ') || 'Usuario'
  const fecha = createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  const accent = CARD_ACCENT[status] ?? 'border-l-4 border-l-slate-200'

  return (
    <motion.div layout variants={cardVariants}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.10)' }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${accent}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/40">
        <Link to={`/profile/${owner?._id ?? owner?.id}`} className="flex items-center gap-2.5 group min-w-0">
          {owner?.photo
            ? <img src={owner.photo} alt={name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
            : <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-accent transition-colors truncate">{name}</p>
            <p className="text-[10px] text-slate-400 font-light">tiene lo que buscás</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {fecha && <span className="hidden sm:block text-[10px] font-light text-slate-400">{fecha}</span>}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${BADGE[status] ?? 'bg-slate-100 text-slate-500'}`}>
            {BADGE_LABEL[status] ?? status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block" /> Lo que ofreciste
          </p>
          <ProductMini photo={offeredPublication?.photos?.[0]} title={offeredPublication?.title} />
          {complementaryAmount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              + ${complementaryAmount.toLocaleString('es-AR')} complementario
            </span>
          )}
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" /> Lo que querés
          </p>
          <ProductMini photo={requestedPublication?.photos?.[0]} title={requestedPublication?.title} />
          {(requestedPublication?._id ?? requestedPublication?.id) && (
            <Link to={`/publications/${requestedPublication?._id ?? requestedPublication?.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-accent hover:underline">
              Ver publicación →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
