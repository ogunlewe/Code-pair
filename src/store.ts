import { create } from 'zustand';

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
  peerId?: string;
}

interface Store {
  isMuted: boolean;
  isVideoOff: boolean;
  participants: Participant[];
  sessionId: string | null;
  isHost: boolean;
  roomCode: string | null;
  toggleMute: () => void;
  toggleVideo: () => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  setSessionId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setRoomCode: (code: string | null) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
}

export const useStore = create<Store>((set) => ({
  isMuted: false,
  isVideoOff: false,
  participants: [],
  sessionId: null,
  isHost: false,
  roomCode: null,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),
  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),
  setSessionId: (id) => set({ sessionId: id }),
  setIsHost: (isHost) => set({ isHost }),
  setRoomCode: (code) => set({ roomCode: code }),
  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}));