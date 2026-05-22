import useAuthStore from '../../../../store/authStore'
import ChatListItem from './ChatListItem'

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

  return (
    <div className="flex flex-col h-full">
      {/* Header sidebar */}
      <div className="shrink-0 px-4 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <h2 className="font-bold text-slate-900 text-base tracking-tight">Mensajes</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Tus conversaciones de intercambio</p>
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

        {!loading && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-slate-400">No tenés conversaciones activas todavía</p>
          </div>
        )}

        {!loading && chats.map(exchange => (
          <ChatListItem
            key={exchange._id}
            exchange={exchange}
            currentUserId={currentUserId}
            isSelected={exchange._id === selectedId}
          />
        ))}
      </div>
    </div>
  )
}
