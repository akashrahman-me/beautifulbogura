'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Small popover menu (account menu, row “more” actions). Esc and outside click close it;
 * arrow keys move between items.
 */
export function Menu({ trigger, children, align = 'end', label }: { trigger: (props: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; align?: 'start' | 'end'; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div role="menu" aria-label={label} className={cn('absolute top-full z-[var(--z-dropdown)] mt-2 flex min-w-60 flex-col rounded-lg border border-line bg-surface-raised p-1.5 shadow-[var(--shadow-lg)]', align === 'end' ? 'right-0' : 'left-0')}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onSelect, tone, disabled }: { children: ReactNode; onSelect: () => void; tone?: 'emergency'; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" disabled={disabled} className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-label hover:bg-surface-sunken focus-visible:bg-surface-sunken disabled:opacity-50', tone === 'emergency' && 'text-emergency')} onClick={onSelect}>
      {children}
    </button>
  );
}
