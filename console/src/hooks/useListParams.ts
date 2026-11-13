import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDebounce } from './useDebounce';

/**
 * Page, search and sort for an admin list, kept in the URL so a view can be shared or bookmarked.
 * Changing the search or sort goes back to page 1; module filters call `resetPage` themselves.
 */
export function useListParams() {
  const [s, set] = useQueryStates({ page: parseAsInteger.withDefault(1), q: parseAsString.withDefault(''), sort: parseAsString });
  const search = useDebounce(s.q.trim());
  return {
    page: s.page,
    q: s.q,
    sort: s.sort,
    search: search || undefined,
    setQ: (q: string) => void set({ q: q || null, page: null }),
    setSort: (sort: string | null) => void set({ sort, page: null }),
    setPage: (page: number) => void set({ page: page <= 1 ? null : page }),
    resetPage: () => void set({ page: null }),
  };
}
