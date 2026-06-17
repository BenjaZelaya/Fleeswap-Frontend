import { create } from 'zustand'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const data = await getNotifications({ limit: 20, page: 1 })
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        loading: false,
        page: 1,
        hasMore: data.pagination ? data.pagination.page < data.pagination.totalPages : false,
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ loading: false })
    }
  },

  loadMore: async () => {
    const { page, loading, hasMore } = get()
    if (loading || !hasMore) return
    set({ loading: true })
    try {
      const nextPage = page + 1
      const data = await getNotifications({ limit: 20, page: nextPage })
      set((state) => ({
        notifications: [...state.notifications, ...data.notifications],
        page: nextPage,
        hasMore: data.pagination ? data.pagination.page < data.pagination.totalPages : false,
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to load more notifications:', error)
      set({ loading: false })
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  markOneAsRead: async (id) => {
    // Optimistic UI: actualizar inmediatamente
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  },

  markAllRead: async () => {
    // Optimistic UI: actualizar inmediatamente
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  },

  setUnreadCount: (n) => {
    set({ unreadCount: n })
  },
}))

export default useNotificationStore
