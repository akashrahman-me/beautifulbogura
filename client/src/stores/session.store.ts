import { create } from 'zustand';
import type { SessionUser } from '@/types/api';

/**
 * Who is signed in. `unknown` until the first `/auth/refresh` answers on page load.
 * The access token itself stays inside api-client (memory only); this holds just the profile.
 */
interface SessionState {
  status: 'unknown' | 'signed-in' | 'signed-out';
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  user: null,
  setUser: (user) => set({ user, status: user ? 'signed-in' : 'signed-out' }),
}));

export const useSession = () => useSessionStore((s) => s.user);
export const useSessionStatus = () => useSessionStore((s) => s.status);
