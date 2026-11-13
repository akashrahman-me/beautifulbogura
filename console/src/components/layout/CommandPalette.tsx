'use client';

import * as RDialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { NAV_ITEMS } from '@/config/nav';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api-client';
import { can } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { useSession } from '@/stores/session.store';
import { Icon, type IconName } from '@/components/ui/Icon';

/** One result from `GET /admin/search?q=`. The API only returns what the caller may see. */
interface SearchHit {
  kind: 'post' | 'user' | 'doctor' | 'directory' | 'institution' | 'donor';
  id: string;
  label: string;
  sub: string;
  href: string;
}
const KIND_ICON: Record<SearchHit['kind'], IconName> = { post: 'document', user: 'user', doctor: 'stethoscope', directory: 'list', institution: 'school', donor: 'drop' };

type Row = { key: string; label: string; sub?: string; icon: IconName; href: string };

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const role = useSession()?.role;
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const term = useDebounce(q.trim(), 200);
  const hits = useQuery({
    queryKey: ['admin', 'search', term],
    queryFn: ({ signal }) => api.get<SearchHit[]>('/admin/search', { q: term }, signal),
    enabled: open && term.length >= 2,
  });

  const rows = useMemo<Row[]>(() => {
    const lower = q.trim().toLowerCase();
    const pages = NAV_ITEMS.filter((i) => can(role, i.permission) && (!lower || `${i.label} ${i.keywords ?? ''}`.toLowerCase().includes(lower))).map((i) => ({ key: `nav:${i.href}`, label: i.label, sub: 'পাতা', icon: i.icon, href: i.href }));
    const found = (hits.data ?? []).map((h) => ({ key: `${h.kind}:${h.id}`, label: h.label, sub: h.sub, icon: KIND_ICON[h.kind], href: h.href }));
    return [...pages, ...found];
  }, [q, role, hits.data]);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setQ('');
      setActive(0);
    }
  };
  const go = (href: string) => {
    close(false);
    router.push(href);
  };

  return (
    <RDialog.Root open={open} onOpenChange={close}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)]" />
        <RDialog.Content className="fixed top-[10vh] left-1/2 z-[var(--z-modal)] flex max-h-[70vh] w-[min(640px,94vw)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface-raised shadow-[var(--shadow-xl)]" aria-describedby={undefined}>
          <RDialog.Title className="bb-sr">খুঁজুন বা কোনো পাতায় যান</RDialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Icon name="search" size={20} className="text-ink-muted" />
            <input
              autoFocus
              className="min-h-14 flex-1 bg-transparent text-body outline-none"
              placeholder="পাতা, পোস্ট, ব্যবহারকারী, ডাক্তার…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, rows.length - 1));
                else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
                else if (e.key === 'Enter' && rows[active]) go(rows[active].href);
                else return;
                e.preventDefault();
              }}
              role="combobox"
              aria-expanded
              aria-controls="cmdk-list"
              aria-activedescendant={rows[active] ? `cmdk-${active}` : undefined}
            />
            <span className="bb-kbd">Esc</span>
          </div>
          <ul id="cmdk-list" role="listbox" className="flex-1 overflow-y-auto p-2">
            {rows.map((r, i) => (
              <li key={r.key} id={`cmdk-${i}`} role="option" aria-selected={i === active}>
                <button type="button" className={cn('flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left', i === active ? 'bg-brand-soft text-brand-strong' : 'hover:bg-surface-sunken')} onMouseEnter={() => setActive(i)} onClick={() => go(r.href)}>
                  <Icon name={r.icon} size={20} />
                  <span className="min-w-0 flex-1 truncate text-label">{r.label}</span>
                  {r.sub && <span className="truncate text-caption text-ink-muted">{r.sub}</span>}
                </button>
              </li>
            ))}
            {rows.length === 0 && <li className="px-3 py-6 text-center text-body-sm text-ink-muted">{hits.isFetching ? 'খোঁজা হচ্ছে…' : 'কিছু পাওয়া যায়নি'}</li>}
          </ul>
          <div className="flex flex-wrap gap-4 border-t border-line px-4 py-2 text-caption text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="bb-kbd">↑</span>
              <span className="bb-kbd">↓</span> বাছুন
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bb-kbd">Enter</span> খুলুন
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bb-kbd">/</span> বা <span className="bb-kbd">⌘K</span> যেকোনো জায়গা থেকে
            </span>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
