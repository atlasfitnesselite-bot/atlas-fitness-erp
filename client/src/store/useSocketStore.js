import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connect: () => {
    if (get().socket) return; // Already connected
    const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket = io(apiUrl, {
      transports: ['websocket', 'polling']
    });
    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
