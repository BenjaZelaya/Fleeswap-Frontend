import { create } from "zustand";

const useAuthStore = create((set) => ({
  //  ESTADO INICIAL (NO LOGUEADO)
  user: null,
  token: null,

  //  LOGIN (guardar usuario)
  setAuth: (user, token) => set({ user, token }),

  //  LOGOUT (limpiar usuario)
  logout: () => set({ user: null, token: null }),
}));

export default useAuthStore;