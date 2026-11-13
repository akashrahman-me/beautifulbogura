import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Per-device lists kept in localStorage: recently viewed services and favourite posts. */
interface LocalState {
  recent: string[];
  favourites: Record<string, string[]>; // kind → ids
  pushRecent: (slug: string) => void;
  toggleFavourite: (kind: string, id: string) => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      recent: [],
      favourites: {},
      pushRecent: (slug) => set((s) => ({ recent: [slug, ...s.recent.filter((x) => x !== slug)].slice(0, 12) })),
      toggleFavourite: (kind, id) =>
        set((s) => {
          const list = s.favourites[kind] ?? [];
          return { favourites: { ...s.favourites, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list] } };
        }),
    }),
    { name: 'bb-local', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

const EMPTY: string[] = [];
export const useFavourites = (kind: string) => useLocalStore((s) => s.favourites[kind] ?? EMPTY);
