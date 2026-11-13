'use client';

/* Interactive primitives: SearchField, ChoiceGroup, Rating, Accordion, Dialog. */
import * as RDialog from '@radix-ui/react-dialog';
import { useId, useState, type ReactNode } from 'react';
import { bn, cn } from '@/lib/utils';
import { FilterChips, type ChipOption } from './Chip';
import { Field, type FieldBaseProps } from './Field';
import { Icon, type IconName } from './Icon';
import { IconButton } from './Button';

/* ---------- SearchField ---------- */
export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = 'কী খুঁজছেন? ডাক্তার, ব্যাংক, হোটেল…',
  label = 'খুঁজুন',
  size = 'md',
  autoFocus,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'md' | 'lg';
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <form
      role="search"
      className={cn('bb-search', `bb-search-${size}`, className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <Icon name="search" size={20} className="bb-search-icon" />
      <input
        type="search"
        className="bb-search-input"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        autoFocus={autoFocus}
        enterKeyHint="search"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="bb-search-clear" aria-label="মুছে ফেলুন" onClick={() => onChange('')}>
          <Icon name="x" size={18} />
        </button>
      )}
    </form>
  );
}

/* ---------- ChoiceGroup ---------- */
type ChoiceSingle<V extends string> = { multiple?: false; value: V | ''; onChange: (v: V) => void };
type ChoiceMulti<V extends string> = { multiple: true; value: V[]; onChange: (v: V[]) => void };

export function ChoiceGroup<V extends string>(props: FieldBaseProps & { options: ChipOption<V>[] } & (ChoiceSingle<V> | ChoiceMulti<V>)) {
  const id = useId();
  const { options, label, hint, error, required, optional, className } = props;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      {props.multiple ? (
        <FilterChips multiple wrap items={options} value={props.value} onChange={props.onChange} label={typeof label === 'string' ? label : undefined} />
      ) : (
        <FilterChips wrap items={options} value={props.value as V} onChange={props.onChange} label={typeof label === 'string' ? label : undefined} />
      )}
    </Field>
  );
}

/* ---------- Rating ---------- */
export function Rating({ value = 0, count, interactive, onRate, size = 18, className }: { value?: number; count?: number; interactive?: boolean; onRate?: (stars: number) => void; size?: number; className?: string }) {
  const [hover, setHover] = useState(0);
  const v = hover || value;
  return (
    <div className={cn('bb-rating', className)} role={interactive ? 'group' : 'img'} aria-label={interactive ? 'রেটিং দিন' : `রেটিং ${bn(value.toFixed(1))} / ৫`}>
      <span className="bb-stars">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = v >= i - 0.25 ? 'full' : v >= i - 0.75 ? 'half' : 'empty';
          const star = (
            <span className={cn('bb-star', `is-${fill}`)} aria-hidden>
              <Icon name="star" size={size} strokeWidth={1.5} />
            </span>
          );
          return interactive ? (
            <button key={i} type="button" className="bb-star-btn" aria-label={`${bn(i)} তারকা দিন`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onRate?.(i)}>
              {star}
            </button>
          ) : (
            <span key={i}>{star}</span>
          );
        })}
      </span>
      {!interactive && value > 0 && <span className="bb-rating-val">{bn(value.toFixed(1))}</span>}
      {count != null && <span className="bb-rating-count">({bn(count)} ভোট)</span>}
    </div>
  );
}

/* ---------- Accordion (works before JS via <details>) ---------- */
export function Accordion({ items, defaultOpen, className }: { items: { id: string; title: ReactNode; content: ReactNode; icon?: IconName; meta?: ReactNode }[]; defaultOpen?: number; className?: string }) {
  return (
    <div className={cn('bb-accordion', className)}>
      {items.map((it, i) => (
        <details key={it.id} className="bb-acc-item" open={defaultOpen === i || undefined}>
          <summary className="bb-acc-head">
            {it.icon && (
              <span className="bb-acc-icon">
                <Icon name={it.icon} size={20} />
              </span>
            )}
            <span className="bb-acc-title">{it.title}</span>
            {it.meta && <span className="bb-acc-meta">{it.meta}</span>}
            <Icon name="chevron-down" size={18} className="bb-acc-caret" />
          </summary>
          <div className="bb-acc-body">{it.content}</div>
        </details>
      ))}
    </div>
  );
}

/* ---------- Dialog: bottom sheet on phones, centred from md ---------- */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone,
  actions,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  tone?: 'emergency';
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <div className="bb-dialog-layer">
          <RDialog.Overlay className="bb-scrim" />
          <RDialog.Content
            className="bb-dialog"
            onOpenAutoFocus={(e) => {
              // Land on the first field (PIN, date…) rather than the close button.
              const field = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('input:not([type=hidden]):not(.bb-sr), textarea, select');
              if (field) {
                e.preventDefault();
                field.focus();
              }
            }}
          >
            <div className="bb-dialog-head">
              {icon && (
                <span className={cn('bb-dialog-icon', tone && `bb-dialog-icon-${tone}`)}>
                  <Icon name={icon} size={22} />
                </span>
              )}
              <RDialog.Title className="bb-dialog-title">{title}</RDialog.Title>
              <RDialog.Close asChild>
                <IconButton icon="x" label="বন্ধ করুন" size="sm" />
              </RDialog.Close>
            </div>
            {description ? <RDialog.Description className="bb-dialog-desc">{description}</RDialog.Description> : <RDialog.Description className="bb-sr">{title}</RDialog.Description>}
            {children && <div className="bb-dialog-body">{children}</div>}
            {actions && <div className="bb-dialog-actions">{actions}</div>}
          </RDialog.Content>
        </div>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
