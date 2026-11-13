'use client';

import * as RDialog from '@radix-ui/react-dialog';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui.store';
import { IconButton } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Misc';
import { AccountMenu } from './AccountMenu';
import { CommandPalette, useCommandPalette } from './CommandPalette';
import { NavList, Sidebar } from './Sidebar';

/** Signed-in frame: sidebar (lg+) or drawer, sticky top bar with search and account, page content. */
export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const palette = useCommandPalette();
  // The drawer belongs to the page it was opened on, so navigating closes it without an effect.
  const pathname = usePathname();
  const [drawerOn, setDrawerOn] = useState<string | null>(null);
  const drawer = drawerOn === pathname;
  const setDrawer = (o: boolean) => setDrawerOn(o ? pathname : null);
  useEffect(() => void useUiStore.persist.rehydrate(), []);

  return (
    <div className={cn('bb-shell', collapsed && 'is-collapsed')}>
      <a href="#main" className="bb-sr focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-surface focus:p-3">
        মূল অংশে যান
      </a>
      <Sidebar />
      <div className="bb-main">
        <header className="bb-topbar">
          <IconButton icon="menu" label="মেনু" className="lg:hidden" onClick={() => setDrawer(true)} />
          <button type="button" className="bb-cmdk-trigger" onClick={() => palette.setOpen(true)} aria-label="খুঁজুন বা কোনো পাতায় যান">
            <Icon name="search" size={18} />
            <span className="flex-1 truncate text-left">খুঁজুন…</span>
            <span className="bb-kbd hidden sm:inline-flex">⌘K</span>
          </button>
          <div className="ml-auto">
            <AccountMenu />
          </div>
        </header>
        <main id="main" className="bb-page" tabIndex={-1}>
          {children}
        </main>
      </div>

      <RDialog.Root open={drawer} onOpenChange={setDrawer}>
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay)] lg:hidden" />
          <RDialog.Content className="fixed inset-y-0 left-0 z-[var(--z-modal)] flex w-[86%] max-w-xs flex-col gap-5 overflow-y-auto bg-surface p-4 shadow-[var(--shadow-xl)] lg:hidden" aria-describedby={undefined}>
            <div className="flex items-center justify-between">
              <Wordmark size="sm" tagline="কনসোল" />
              <RDialog.Close asChild>
                <IconButton icon="x" label="বন্ধ করুন" />
              </RDialog.Close>
            </div>
            <RDialog.Title className="bb-sr">কনসোল মেনু</RDialog.Title>
            <NavList />
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </div>
  );
}

/** Full-frame placeholder while the session is checked. */
export function ShellSkeleton() {
  return (
    <div className="bb-shell" aria-busy="true">
      <aside className="bb-side" />
      <div className="bb-main">
        <header className="bb-topbar" />
      </div>
    </div>
  );
}
