import { create } from 'zustand';

interface Store {
  isMuted: boolean;
  isVideoOff: boolean;
  connectionStatus: string;
  toggleMute: () => void;
  toggleVideo: () => void;
  setConnectionStatus: (status: string) => void;
}

export const useStore = create<Store>((set) => ({
  isMuted: false,
  isVideoOff: false,
  connectionStatus: 'disconnected',
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));