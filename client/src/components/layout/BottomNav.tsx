'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from '@/components/ui/Icon';

const ITEMS: { href: string; label: string; icon: IconName; tone?: 'emergency' }[] = [
  { href: '/services', label: 'সেবাসমূহ', icon: 'grid' },
  { href: '/blood-bank', label: 'রক্ত ব্যাংক', icon: 'drop' },
  { href: '/', label: 'হোম', icon: 'home' },
  { href: '/emergency', label: 'জরুরি', icon: 'siren', tone: 'emergency' },
  { href: '/weather', label: 'আবহাওয়া', icon: 'cloud-sun' },
];

/** Fixed five-tab bar on phones and tablets; hidden from lg where the header carries the nav. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bb-bottomnav" aria-label="নিচের মেনু">
      {ITEMS.map((it) => {
        const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={cn('bb-bottomnav-item', active && 'is-active', it.tone && `bb-bottomnav-${it.tone}`)} aria-current={active ? 'page' : undefined}>
            <span className="bb-bottomnav-pill">
              <Icon name={it.icon} size={22} />
            </span>
            <span className="bb-bottomnav-label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
