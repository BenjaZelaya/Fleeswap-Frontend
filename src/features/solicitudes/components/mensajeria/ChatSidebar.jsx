import { useState, useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../../../store/authStore'
import ChatListItem from './ChatListItem'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'exchange', label: 'Intercambios' },
  { value: 'purchase', label: 'Compras' },
]

function SkeletonItem() {
  return (
    <div className="px-4 py-3 flex items-center gap-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function ChatSidebar({ chats, selectedId, loading }) {
  const { user } = useAuthStore()
  const currentUserId = user?._id ?? user?.id
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = chats
    if (activeFilter !== 'all') {
      list = chats.filter(c => (c.type ?? 'exchange') === activeFilter)
    }
    // Ordenar por actividad (el más reciente arriba)
    return [...list].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })
  }, [chats, activeFilter])

  return (
    <div className="flex flex-col h-full">
      {/* Header sidebar */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm space-y-3">
        <div>
          <h2 className="font-bold text-slate-900 text-base tracking-tight">Mensajes</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Tus conversaciones activas</p>
        </div>

        {/* Pills de filtro */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all border ${activeFilter === f.value
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista scrolleable */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-slate-400">
              {activeFilter === 'all' ? 'No tenés conversaciones activas' : `No tenés ${activeFilter === 'exchange' ? 'intercambios' : 'compras'} activos`}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {!loading && filtered.map(exchange => (
            <motion.div
              key={exchange._id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
            >
              <ChatListItem
                exchange={exchange}
                currentUserId={currentUserId}
                isSelected={exchange._id === selectedId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
