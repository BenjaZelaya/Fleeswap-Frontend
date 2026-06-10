import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import useAuthStore from '../../../store/authStore'
import { getMisChats } from '../services/solicitudService'
import ChatSidebar   from '../components/mensajeria/ChatSidebar'
import ChatEmptyState from '../components/mensajeria/ChatEmptyState'
import ChatView       from './ChatView'

function getSocketURL() {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

export default function MensajeriaView() {
  const { intercambioId } = useParams()
  const navigate          = useNavigate()
  const { token }         = useAuthStore()

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

  // ── Socket global para escuchar mensajes y reordenar el sidebar ──────────
  useEffect(() => {
    if (!token || token === 'undefined' || token === 'null') return

    const socket = io(getSocketURL(), {
      auth: { token },
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    })

    // Unirse a todos los chats activos para escuchar mensajes
    socket.on('connect', () => {
      chats.forEach(chat => {
        if (chat.status === 'active') {
          socket.emit('chat:join', { exchangeId: chat._id })
        }
      })
    })

    // Cuando llega un mensaje, mover ese chat al tope del sidebar
    socket.on('chat:message', (msg) => {
      setChats(prev => {
        // Encontrar el chat al que pertenece este mensaje
        // y actualizar su updatedAt para que suba al tope
        const updated = prev.map(chat => {
          // El mensaje llegó por el socket de la room `chat:${exchangeId}`
          // Como no sabemos el exchangeId del mensaje directamente,
          // necesitamos comparar — pero podemos simplemente re-fetch
          return chat
        })
        return updated
      })
      // Re-fetch para obtener el orden correcto desde el servidor
      fetchChats()
    })

    socket.connect()

    return () => {
      socket.off('connect')
      socket.off('chat:message')
      socket.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chats.length])

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
