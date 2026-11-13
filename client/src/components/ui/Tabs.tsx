'use client';

import type { ReactNode } from 'react';
import { bn, cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

export interface TabItem<V extends string> {
  value: V;
  label: ReactNode;
  count?: number;
  icon?: IconName;
}

/** Switches between views of the same content. `underline` for pages, `pill` inside cards. */
export function Tabs<V extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  block,
  label,
  className,
}: {
  items: TabItem<V>[];
  value: V;
  onChange: (v: V) => void;
  variant?: 'underline' | 'pill';
  block?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn('bb-tabs', `bb-tabs-${variant}`, block && 'bb-tabs-block', className)} role="tablist" aria-label={label}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            className={cn('bb-tab', on && 'is-active')}
            onClick={() => onChange(it.value)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const i = items.findIndex((x) => x.value === value);
              const next = items[(i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length];
              onChange(next.value);
            }}
          >
            {it.icon && <Icon name={it.icon} size={18} />}
            <span>{it.label}</span>
            {it.count != null && <span className="bb-tab-count">{bn(it.count)}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function SegmentedControl<V extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: TabItem<V>[];
  value: V;
  onChange: (v: V) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('bb-seg', className)} role="radiogroup" aria-label={label}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button key={it.value} type="button" role="radio" aria-checked={on} className={cn('bb-seg-item', on && 'is-active')} onClick={() => onChange(it.value)}>
            {it.icon && <Icon name={it.icon} size={18} />}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
