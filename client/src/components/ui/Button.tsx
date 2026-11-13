import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'emergency' | 'danger-ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

type BaseProps = {
  variant?: ButtonVariant;
  size?: Size;
  iconLeft?: IconName;
  iconRight?: IconName;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

type AsButton = BaseProps & Omit<ComponentProps<'button'>, keyof BaseProps> & { href?: undefined };
type AsLink = BaseProps & Omit<ComponentProps<'a'>, keyof BaseProps> & { href: string };

/** Verb-first Bangla labels. One `primary` per view; `emergency` only for life-safety calls. */
export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', size = 'md', iconLeft, iconRight, block, loading, children, className, ...rest } = props;
  const cls = cn('bb-btn', `bb-btn-${variant}`, `bb-btn-${size}`, block && 'bb-btn-block', loading && 'is-loading', className);
  const iconSize = size === 'sm' ? 18 : 20;
  const inner = (
    <>
      {loading ? <span className="bb-spinner" aria-hidden /> : iconLeft ? <Icon name={iconLeft} size={iconSize} /> : null}
      {children != null && <span className="bb-btn-label">{children}</span>}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </>
  );

  if (rest.href !== undefined) {
    const { href, ...a } = rest as AsLink;
    const external = /^(https?:|tel:|mailto:)/.test(href);
    return external ? (
      <a className={cls} href={href} {...a}>
        {inner}
      </a>
    ) : (
      <Link className={cls} href={href} {...a}>
        {inner}
      </Link>
    );
  }
  const b = rest as AsButton;
  return (
    <button type="button" {...b} className={cls} disabled={b.disabled || loading} aria-busy={loading || undefined}>
      {inner}
    </button>
  );
}

type IconButtonBase = {
  icon: IconName;
  /** Bangla label: becomes aria-label and tooltip. */
  label: string;
  variant?: 'ghost' | 'secondary' | 'brand' | 'emergency';
  size?: 'sm' | 'md';
  badge?: boolean;
  className?: string;
};

export function IconButton(props: IconButtonBase & (Omit<ComponentProps<'button'>, keyof IconButtonBase> | (Omit<ComponentProps<'a'>, keyof IconButtonBase> & { href: string }))) {
  const { icon, label, variant = 'ghost', size = 'md', badge, className, ...rest } = props;
  const cls = cn('bb-iconbtn', `bb-iconbtn-${variant}`, `bb-iconbtn-${size}`, className);
  const inner = (
    <>
      <Icon name={icon} size={size === 'sm' ? 18 : 22} />
      {badge && <span className="bb-iconbtn-dot" aria-hidden />}
    </>
  );
  if ('href' in rest && rest.href) {
    const { href, ...a } = rest as ComponentProps<'a'> & { href: string };
    return /^(https?:|tel:)/.test(href) ? (
      <a className={cls} href={href} aria-label={label} title={label} {...a}>
        {inner}
      </a>
    ) : (
      <Link className={cls} href={href} aria-label={label} title={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} title={label} {...(rest as ComponentProps<'button'>)}>
      {inner}
    </button>
  );
}
