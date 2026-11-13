'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, isActive } from '@/config/nav';
import { can } from '@/lib/permissions';
import { bn, cn } from '@/lib/utils';
import { useSession } from '@/stores/session.store';
import { useUiStore } from '@/stores/ui.store';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Misc';
import { useCounts } from '@/features/dashboard/hooks/useDashboard';

/** Grouped navigation, filtered by role, with live counts on the queues. Used in the sidebar and the phone drawer. */
export function NavList({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const role = useSession()?.role;
  const counts = useCounts().data;
  return (
    <nav className="flex flex-col gap-5" aria-label="কনসোল মেনু">
      {NAV.map((g) => {
        const items = g.items.filter((i) => can(role, i.permission));
        if (!items.length) return null;
        return (
          <div key={g.heading} className="bb-side-group">
            <p className="bb-side-heading">{g.heading}</p>
            {items.map((i) => {
              const on = isActive(i.href, pathname);
              const n = i.count ? (counts?.[i.count] ?? 0) : 0;
              return (
                <Link key={i.href} href={i.href} className={cn('bb-side-link', on && 'is-active')} aria-current={on ? 'page' : undefined} title={collapsed ? i.label : undefined}>
                  <Icon name={i.icon} size={22} />
                  <span className="bb-side-label">{i.label}</span>
                  {n > 0 && (
                    <span className="bb-side-count" aria-label={`${bn(n)}টি অপেক্ষমাণ`}>
                      {n > 99 ? '৯৯+' : bn(n)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  return (
    <aside className="bb-side" aria-label="সাইডবার">
      <div className={cn('flex items-center gap-2 px-2', collapsed && 'justify-center px-0')}>
        <Link href="/" aria-label="কনসোল — ড্যাশবোর্ড" className={cn(collapsed && 'hidden')}>
          <Wordmark size="sm" tagline="কনসোল" />
        </Link>
        <button type="button" className={cn('bb-iconbtn bb-iconbtn-ghost bb-iconbtn-sm', !collapsed && 'ml-auto')} onClick={toggle} aria-label={collapsed ? 'সাইডবার বড় করুন' : 'সাইডবার ছোট করুন'} aria-pressed={collapsed}>
          <Icon name="sidebar" size={18} />
        </button>
      </div>
      <NavList collapsed={collapsed} />
    </aside>
  );
}
