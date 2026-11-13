import { create } from 'zustand';
import type { StaffUser } from '@/types/api';

/** Who is signed in. `unknown` until the first `/auth/refresh` answers. The token stays in api-client memory. */
interface SessionState {
  status: 'unknown' | 'signed-in' | 'signed-out';
  user: StaffUser | null;
  setUser: (user: StaffUser | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  user: null,
  setUser: (user) => set({ user, status: user ? 'signed-in' : 'signed-out' }),
}));

export const useSession = () => useSessionStore((s) => s.user);
export const useSessionStatus = () => useSessionStore((s) => s.status);
