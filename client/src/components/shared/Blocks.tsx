'use client';

/* Shared page-level building blocks from the design system. */
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { bn, bnNumber, cn, formatPhone, latin, telHref, waHref } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';
import { FilterChips, type ChipOption } from '@/components/ui/Chip';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SearchField } from '@/components/ui/Interactive';

/* ---------- PageHeader ---------- */
export function PageHeader({ title, eyebrow, description, back, action, className }: { title: ReactNode; eyebrow?: string; description?: ReactNode; back?: { href: string; label: string }; action?: ReactNode; className?: string }) {
  return (
    <header className={cn('flex flex-col gap-3 pt-5 pb-4 lg:pt-8', className)}>
      {back && (
        <Link href={back.href} className="bb-linkbtn bb-linkbtn-muted -ml-1 self-start">
          <Icon name="arrow-left" size={18} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          {eyebrow && <p className="text-overline text-accent">{eyebrow}</p>}
          <h1 className="text-display-lg">{title}</h1>
          {description && <p className="text-body-sm max-w-2xl text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

/* ---------- SectionHeader ---------- */
export function SectionHeader({ title, eyebrow, count, description, action, as: As = 'h2' }: { title: ReactNode; eyebrow?: string; count?: number; description?: ReactNode; action?: { label: string; href: string }; as?: 'h2' | 'h3' }) {
  return (
    <div className="bb-sechead">
      <div>
        {eyebrow && <p className="bb-sechead-eyebrow">{eyebrow}</p>}
        <As className="bb-sechead-title">
          {title}
          {count != null && <span className="bb-sechead-count">{bn(count)}</span>}
        </As>
        {description && <p className="bb-sechead-desc">{description}</p>}
      </div>
      {action && (
        <Link className="bb-sechead-action" href={action.href}>
          {action.label}
          <Icon name="chevron-right" size={18} />
        </Link>
      )}
    </div>
  );
}

/* ---------- StatStrip ---------- */
export function StatStrip({ items }: { items: { label: string; value: number | string; tone?: 'brand' | 'success' | 'warning' | 'emergency' | 'accent'; icon?: IconName }[] }) {
  return (
    <dl className="bb-stats">
      {items.map((it) => (
        <div key={it.label} className={cn('bb-stat', it.tone && `bb-stat-${it.tone}`)}>
          <dt>
            {it.icon && <Icon name={it.icon} size={16} />}
            {it.label}
          </dt>
          <dd>{typeof it.value === 'number' ? bnNumber(it.value) : it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- ContactActions: the tap-to-call row ---------- */
export function ContactActions({ phone, whatsapp, copy, compact, tone, callLabel, size }: { phone: string; whatsapp?: boolean | string; copy?: boolean; compact?: boolean; tone?: 'emergency'; callLabel?: string; size?: 'sm' | 'md' }) {
  const [copied, setCopied] = useState(false);
  const wa = whatsapp === true ? phone : whatsapp || null;
  const doCopy = () => {
    navigator.clipboard?.writeText(latin(phone)).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  if (compact) {
    return (
      <div className="bb-contact bb-contact-compact">
        <IconButton icon="phone" label={`কল করুন ${formatPhone(phone)}`} variant={tone === 'emergency' ? 'emergency' : 'brand'} href={telHref(phone)} />
        {wa && <IconButton icon="whatsapp" label="হোয়াটসঅ্যাপে মেসেজ দিন" variant="secondary" href={waHref(wa)} target="_blank" rel="noopener noreferrer" />}
        {copy && <IconButton icon={copied ? 'check' : 'copy'} label={copied ? 'কপি হয়েছে' : 'নম্বর কপি করুন'} variant="secondary" onClick={doCopy} />}
      </div>
    );
  }
  return (
    <div className="bb-contact">
      <Button variant={tone === 'emergency' ? 'emergency' : 'primary'} iconLeft="phone" href={telHref(phone)} size={size}>
        {callLabel ?? 'কল করুন'}
      </Button>
      {wa && (
        <Button variant="secondary" iconLeft="whatsapp" href={waHref(wa)} target="_blank" rel="noopener noreferrer" size={size}>
          হোয়াটসঅ্যাপ
        </Button>
      )}
      {copy && (
        <Button variant="ghost" iconLeft={copied ? 'check' : 'copy'} onClick={doCopy} size={size} aria-live="polite">
          {copied ? 'কপি হয়েছে' : 'কপি'}
        </Button>
      )}
    </div>
  );
}

/** Printed phone number that is also a tel: link. */
export function PhoneLink({ phone }: { phone: string }) {
  return (
    <a className="bb-phone" href={telHref(phone)}>
      {formatPhone(phone)}
    </a>
  );
}

/* ---------- NoticeBanner: the “জরুরি বার্তা” moderation notice ---------- */
export function NoticeBanner({ title = 'জরুরি বার্তা', children, action, defaultOpen = false }: { title?: string; children: ReactNode; action?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bb-notice">
      <button type="button" className="bb-notice-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="bb-notice-icon">
          <Icon name="megaphone" size={20} />
        </span>
        <span className="bb-notice-title">{title}</span>
        <Icon name="chevron-down" size={18} className="bb-notice-caret" />
      </button>
      {open && (
        <div className="bb-notice-body">
          {children}
          {action && <div className="bb-notice-action">{action}</div>}
        </div>
      )}
    </section>
  );
}

/* ---------- FilterBar ---------- */
export function FilterBar<V extends string>({
  query,
  onQuery,
  placeholder,
  chips,
  chipValue,
  onChip,
  count,
  countLabel = 'টি ফলাফল',
  onClear,
  trailing,
  children,
}: {
  query: string;
  onQuery: (q: string) => void;
  placeholder?: string;
  chips?: ChipOption<V>[];
  chipValue?: V;
  onChip?: (v: V) => void;
  count?: number;
  countLabel?: string;
  onClear?: () => void;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bb-filterbar">
      <div className="bb-filterbar-top">
        <SearchField value={query} onChange={onQuery} placeholder={placeholder} />
        {trailing}
      </div>
      {chips && chipValue !== undefined && onChip && <FilterChips items={chips} value={chipValue} onChange={onChip} label="ফিল্টার" />}
      {children}
      <div className="bb-filterbar-foot">
        <p className="bb-filterbar-count" aria-live="polite">
          {count == null ? ' ' : `${bnNumber(count)}${countLabel.startsWith('টি') ? '' : ' '}${countLabel}`}
        </p>
        {onClear && (
          <button type="button" className="bb-linkbtn" onClick={onClear}>
            <Icon name="x" size={16} />
            ফিল্টার মুছুন
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- LoadMore ---------- */
export function LoadMore({ hasMore, loading, onClick }: { hasMore: boolean; loading: boolean; onClick: () => void }) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-2">
      <Button variant="secondary" iconRight="chevron-down" loading={loading} onClick={onClick}>
        আরও দেখুন
      </Button>
    </div>
  );
}
