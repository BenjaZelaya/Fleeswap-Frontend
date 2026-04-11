import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }))
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
