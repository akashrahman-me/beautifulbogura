'use client';

import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import { CATEGORIES, SERVICES, type Service } from '@/config/services';
import { cn } from '@/lib/utils';
import { useLocalStore } from '@/stores/local.store';
import { FilterChips } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/shared/States';

export function ServiceTile({ service }: { service: Service }) {
  const pushRecent = useLocalStore((s) => s.pushRecent);
  return (
    <Link href={service.href} className="bb-tile" onClick={() => pushRecent(service.slug)}>
      <span className={cn('bb-tile-icon', `bb-tone-${service.tone}`)}>
        <Icon name={service.icon} size={26} strokeWidth={1.6} />
      </span>
      <span className="bb-tile-label">{service.label}</span>
      {service.soon && <span className="bb-tile-badge">শীঘ্রই</span>}
    </Link>
  );
}

export function ServiceTiles({ services }: { services: Service[] }) {
  return (
    <ul className="bb-tilegrid" role="list">
      {services.map((s) => (
        <li key={s.slug}>
          <ServiceTile service={s} />
        </li>
      ))}
    </ul>
  );
}

/** All-services grid with category chips; the category lives in the URL (?cat=health). */
export function ServiceGrid() {
  const [cat, setCat] = useQueryState('cat', parseAsString.withDefault('all').withOptions({ scroll: false }));
  const services = cat === 'all' ? SERVICES : SERVICES.filter((s) => s.category === cat);
  const cats = CATEGORIES.filter((c) => c.value === 'all' || SERVICES.some((s) => s.category === c.value));
  return (
    <div className="flex flex-col gap-4">
      <FilterChips label="বিভাগ" items={cats} value={cat} onChange={(v) => void setCat(v === 'all' ? null : v)} />
      {services.length ? <ServiceTiles services={services} /> : <EmptyState title="এই বিভাগে এখনো কোনো সেবা নেই" />}
    </div>
  );
}
