'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { bn, cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

type ChipProps = {
  selected?: boolean;
  count?: number;
  icon?: IconName;
  tone?: 'emergency';
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<'button'>, 'children'>;

export function Chip({ selected, count, icon, tone, href, children, className, ...rest }: ChipProps) {
  const cls = cn('bb-chip', selected && 'is-selected', tone && `bb-chip-${tone}`, className);
  const inner = (
    <>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {count != null && <span className="bb-chip-count">{bn(count)}</span>}
    </>
  );
  if (href) {
    return /^https?:/.test(href) ? (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    ) : (
      <Link className={cls} href={href}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-pressed={!!selected} {...rest}>
      {inner}
    </button>
  );
}

export interface ChipOption<V extends string = string> {
  value: V;
  label: ReactNode;
  count?: number;
  icon?: IconName;
  tone?: 'emergency';
}

type Single<V extends string> = { multiple?: false; value: V; onChange: (v: V) => void };
type Multi<V extends string> = { multiple: true; value: V[]; onChange: (v: V[]) => void };

/** A row of chips that filters a list. Scrolls sideways on phones unless `wrap`. */
export function FilterChips<V extends string>(
  props: { items: ChipOption<V>[]; label?: string; wrap?: boolean; className?: string } & (Single<V> | Multi<V>),
) {
  const { items, label, wrap, className } = props;
  const isOn = (v: V) => (props.multiple ? props.value.includes(v) : props.value === v);
  const toggle = (v: V) => {
    if (props.multiple) {
      props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
    } else props.onChange(v);
  };
  return (
    <div className={cn('bb-chips', wrap ? 'bb-chips-wrap' : 'bb-chips-scroll', className)} role="group" aria-label={label}>
      {items.map((it) => (
        <Chip key={it.value} selected={isOn(it.value)} count={it.count} icon={it.icon} tone={it.tone} onClick={() => toggle(it.value)}>
          {it.label}
        </Chip>
      ))}
    </div>
  );
}
