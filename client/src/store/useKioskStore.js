import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useKioskStore = create(
  persist(
    (set, get) => ({
      kioskToken: null,
      deviceCode: null,
      deviceName: null,
      branch: null,
      offlineQueue: [],
      
      setSession: (token, deviceCode, deviceName, branch) => set({
        kioskToken: token,
        deviceCode,
        deviceName,
        branch
      }),
      
      clearSession: () => set({
        kioskToken: null,
        deviceCode: null,
        deviceName: null,
        branch: null
      }),
      
      queueOfflineAction: (action) => set((state) => ({
        offlineQueue: [...state.offlineQueue, action]
      })),
      
      clearOfflineQueue: () => set({ offlineQueue: [] })
    }),
    {
      name: 'atlas-kiosk-storage', // unique name
    }
  )
);
