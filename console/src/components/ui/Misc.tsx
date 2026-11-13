/* Small presentational pieces from the design system. */
import type { ReactNode } from 'react';
import { bn, cn, initialOf } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

/* ---------- FormSteps ---------- */
export function FormSteps({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn('bb-steps', className)} aria-label="ধাপ">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={s} className={cn('bb-step', `is-${state}`)} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="bb-step-num">{state === 'done' ? <Icon name="check" size={16} strokeWidth={2.5} /> : bn(i + 1)}</span>
            <span className="bb-step-label">{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Alert ---------- */
type Tone = 'info' | 'success' | 'warning' | 'danger';
const TONE_ICON: Record<Tone, IconName> = { info: 'info', success: 'check', warning: 'alert', danger: 'alert' };

export function Alert({ tone = 'info', title, icon, action, children, className }: { tone?: Tone; title?: ReactNode; icon?: IconName; action?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('bb-alert', `bb-alert-${tone}`, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <span className="bb-alert-icon">
        <Icon name={icon ?? TONE_ICON[tone]} size={20} />
      </span>
      <div className="bb-alert-body">
        {title && <p className="bb-alert-title">{title}</p>}
        {children && <div className="bb-alert-text">{children}</div>}
        {action && <div className="bb-alert-action">{action}</div>}
      </div>
    </div>
  );
}

/* ---------- Avatar ---------- */
export type AvatarTone = 'brand' | 'accent' | 'gold' | 'emergency' | 'info' | 'neutral';
export function Avatar({ name, src, icon, tone = 'brand', size = 'md', square, className }: { name?: string; src?: string | null; icon?: IconName; tone?: AvatarTone; size?: 'sm' | 'md' | 'lg'; square?: boolean; className?: string }) {
  return (
    <span className={cn('bb-avatar', `bb-avatar-${size}`, `bb-tone-${tone}`, square && 'bb-avatar-square', className)} aria-hidden>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- user photos come from the API host
        <img src={src} alt="" loading="lazy" />
      ) : icon ? (
        <Icon name={icon} size={size === 'lg' ? 28 : 22} />
      ) : (
        initialOf(name ?? '')
      )}
    </span>
  );
}

/* ---------- Bricks (Mahasthangarh brick bond) ---------- */
export function Bricks({ rows = 5, cols = 6, sparse, className }: { rows?: number; cols?: number; sparse?: boolean; className?: string }) {
  const w = 28;
  const h = 12;
  const g = 4;
  const out: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? -(w + g) / 2 : 0;
    for (let c = 0; c < cols + 1; c++) {
      const x = off + c * (w + g);
      if (x + w < 0) continue;
      if (sparse && (r * 7 + c * 3) % 5 === 0) continue;
      out.push(<rect key={`${r}-${c}`} x={x} y={r * (h + g)} width={w} height={h} rx={3} />);
    }
  }
  const W = cols * (w + g);
  const H = rows * (h + g);
  return (
    <svg className={cn('bb-bricks', className)} viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden preserveAspectRatio="xMinYMin slice">
      {out}
    </svg>
  );
}

/* ---------- Wordmark (stands in until a logo exists) ---------- */
export function Wordmark({ size = 'md', tagline, className }: { size?: 'sm' | 'md' | 'lg'; tagline?: string; className?: string }) {
  return (
    <span className={cn('bb-wordmark', `bb-wordmark-${size}`, className)}>
      <span className="bb-wordmark-mark" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="bb-wordmark-text">
        <span className="bb-wordmark-name">বিউটিফুল বগুড়া</span>
        {tagline && <span className="bb-wordmark-tag">{tagline}</span>}
      </span>
    </span>
  );
}

/* ---------- MetaList ---------- */
export function MetaList({ items }: { items: ({ icon?: IconName; text: ReactNode } | false | null | undefined | '' | 0)[] }) {
  const rows = items.filter(Boolean) as { icon?: IconName; text: ReactNode }[];
  if (!rows.length) return null;
  return (
    <ul className="bb-meta">
      {rows.map((m, i) => (
        <li key={i}>
          <Icon name={m.icon ?? 'pin'} size={16} />
          <span>{m.text}</span>
        </li>
      ))}
    </ul>
  );
}
