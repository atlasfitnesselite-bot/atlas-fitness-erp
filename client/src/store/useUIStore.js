import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  notificationsOpen: false,
  toggleNotifications: () => set((state) => ({ notificationsOpen: !state.notificationsOpen })),
  setNotificationsOpen: (isOpen) => set({ notificationsOpen: isOpen }),
  
  searchOpen: false,
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  setSearchOpen: (isOpen) => set({ searchOpen: isOpen }),
}))
