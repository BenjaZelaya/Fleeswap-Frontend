import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMisChats } from '../services/solicitudService'
import ChatSidebar   from '../components/mensajeria/ChatSidebar'
import ChatEmptyState from '../components/mensajeria/ChatEmptyState'
import ChatView       from './ChatView'

export default function MensajeriaView() {
  const { intercambioId } = useParams()
  const navigate          = useNavigate()

  const [chats,   setChats]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMisChats()
      setChats(data)
    } catch {
      // Si falla la carga de la lista, la sidebar queda vacía — no es fatal
      setChats([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchChats() }, [fetchChats])

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── Panel izquierdo: Sidebar ──────────────────────────────────── */}
      {/* Mobile: visible solo cuando NO hay chat activo */}
      {/* Desktop: siempre visible */}
      <div className={`
        ${intercambioId ? 'hidden md:flex' : 'flex'}
        w-full md:w-80 flex-col
        border-r border-slate-100 shrink-0
      `}>
        <ChatSidebar
          chats={chats}
          selectedId={intercambioId}
          loading={loading}
        />
      </div>

      {/* ── Panel derecho: Chat activo o empty state ──────────────────── */}
      {/* Mobile: visible solo cuando HAY chat activo */}
      {/* Desktop: siempre visible */}
      <div className={`
        ${intercambioId ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col min-w-0
      `}>
        {intercambioId
          ? (
            <ChatView
              key={intercambioId}
              exchangeId={intercambioId}
              exchange={chats.find(c => c._id === intercambioId) ?? null}
              onBack={() => navigate('/chats')}
            />
          )
          : <ChatEmptyState />
        }
      </div>

    </div>
  )
}
