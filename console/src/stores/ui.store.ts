import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Per-device console preferences. */
interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist((set) => ({ sidebarCollapsed: false, toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })) }), {
    name: 'bb-console-ui',
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
  }),
);
