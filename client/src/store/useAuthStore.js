import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
      hasRole: (role) => {
        const state = useAuthStore.getState()
        if (!state.user || !state.user.roles) return false
        return state.user.roles.includes(role)
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
