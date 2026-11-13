'use client';

import * as RDialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { themeStore } from '@/lib/theme';
import { CATEGORIES, SERVICES, SOCIAL } from '@/config/services';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Misc';

const NAV = [
  { label: 'হোম', href: '/' },
  { label: 'সেবাসমূহ', href: '/services' },
  { label: 'রক্ত ব্যাংক', href: '/blood-bank' },
  { label: 'ডাক্তার', href: '/doctors' },
  { label: 'চাকরি', href: '/jobs' },
  { label: 'বাসা ভাড়া', href: '/to-let' },
  { label: 'জরুরি', href: '/emergency' },
];

export function ThemeToggle() {
  // Server snapshot is 'light'; the real value arrives right after hydration.
  const dark = useSyncExternalStore(themeStore.subscribe, () => themeStore.get() === 'dark', () => false);
  return (
    <IconButton
      icon={dark ? 'sun' : 'moon'}
      label={dark ? 'লাইট মোড' : 'ডার্ক মোড'}
      aria-pressed={dark}
      onClick={() => themeStore.set(dark ? 'light' : 'dark')}
    />
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const [elevated, setElevated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const on = () => setElevated(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={cn('bb-header', elevated && 'is-elevated')}>
      <div className="bb-header-inner">
        <Link href="/" className="bb-header-brand" aria-label="বিউটিফুল বগুড়া — হোম">
          <Wordmark size="sm" />
        </Link>
        <nav className="bb-header-nav" aria-label="প্রধান মেনু">
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={cn('bb-header-link', active && 'is-active')} aria-current={active ? 'page' : undefined}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="bb-header-actions">
          <IconButton icon="search" label="খুঁজুন" href="/search" />
          <ThemeToggle />
          <IconButton icon="menu" label="মেনু" className="bb-header-menu" onClick={() => setMenuOpen(true)} />
        </div>
      </div>
      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}

function SideMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const pathname = usePathname();
  useEffect(() => onOpenChange(false), [pathname, onOpenChange]);

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-[300] bg-[var(--overlay)]" />
        <RDialog.Content className="fixed inset-y-0 right-0 z-[400] flex w-[88%] max-w-sm flex-col gap-5 overflow-y-auto bg-surface-raised p-5 shadow-[var(--shadow-xl)]">
          <div className="flex items-center justify-between">
            <Wordmark size="sm" />
            <RDialog.Close asChild>
              <IconButton icon="x" label="বন্ধ করুন" />
            </RDialog.Close>
          </div>
          <RDialog.Title className="bb-sr">মেনু</RDialog.Title>
          <RDialog.Description className="bb-sr">সব সেবা বিভাগ অনুযায়ী</RDialog.Description>
          <nav className="flex flex-col gap-5" aria-label="সব সেবা">
            {CATEGORIES.filter((c) => c.value !== 'all').map((c) => {
              const items = SERVICES.filter((s) => s.category === c.value);
              if (!items.length) return null;
              return (
                <section key={c.value} className="flex flex-col gap-1">
                  <h2 className="text-overline text-accent">{c.label}</h2>
                  {items.map((s) => (
                    <Link key={s.slug} href={s.href} className="flex min-h-11 items-center gap-3 rounded-md px-2 text-label hover:bg-surface-sunken">
                      <Icon name={s.icon} size={20} className={s.tone === 'emergency' ? 'text-emergency' : 'text-brand'} />
                      {s.label}
                      {s.soon && <span className="ml-auto text-caption text-ink-subtle">শীঘ্রই</span>}
                    </Link>
                  ))}
                </section>
              );
            })}
          </nav>
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            {SOCIAL.map((s) => (
              <Chip key={s.label} href={s.href}>
                {s.label}
              </Chip>
            ))}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
