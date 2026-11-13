'use client';

import { useState } from 'react';
import { bn, bnNumber, formatDate } from '@/lib/utils';

/** A “nice” ceiling for the axis: 1, 2, 5 × 10ⁿ. */
const niceMax = (v: number) => {
  if (v <= 0) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};

/**
 * One series over time as thin columns: brand fill, 4px rounded tops on the baseline, 2px gaps,
 * recessive grid, hover/focus tooltip, and a table for screen readers. No legend — the title names it.
 */
export function TimeBars({ data, label, unit }: { data: { date: string; value: number }[]; label: string; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [max, max / 2, 0];
  const h = 180;
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative flex gap-3">
        <div className="flex flex-col justify-between text-caption text-ink-subtle tabular-nums" style={{ height: h }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {bn(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height: h }}>
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-line" style={{ top: `${(1 - t / max) * 100}%` }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" aria-hidden>
            {data.map((d, i) => (
              <div key={d.date} className="relative flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div className="w-full rounded-t-[4px] bg-brand transition-opacity" style={{ height: `${Math.max(d.value ? 2 : 0, (d.value / max) * 100)}%`, opacity: hover === null || hover === i ? 1 : 0.45 }} />
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-[var(--ink)] px-3 py-1.5 text-caption whitespace-nowrap text-[var(--canvas)] shadow-[var(--shadow-lg)]"
              style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
            >
              {formatDate(data[hover].date, false)} · {bnNumber(data[hover].value)} {unit}
            </div>
          )}
        </div>
      </div>
      <div className="ml-8 flex justify-between text-caption text-ink-subtle" aria-hidden>
        {data
          .filter((_, i) => i % 7 === 0 || i === data.length - 1)
          .map((d) => (
            <span key={d.date}>{formatDate(d.date, false)}</span>
          ))}
      </div>
      <table className="bb-sr">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>তারিখ</th>
            <th>{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{formatDate(d.date)}</td>
              <td>{bn(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Magnitude across a few categories: one hue, sorted, value labelled at the end of each bar. */
export function CategoryBars({ data }: { data: { key: string; label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="flex flex-col gap-3">
      {[...data]
        .sort((a, b) => b.value - a.value)
        .map((d) => (
          <li key={d.key} className="grid grid-cols-[minmax(84px,auto)_1fr_auto] items-center gap-3 text-body-sm">
            <span className="text-ink-muted">{d.label}</span>
            <span className="h-3 rounded-r-[4px] bg-brand" style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }} aria-hidden />
            <span className="text-label tabular-nums">{bnNumber(d.value)}</span>
          </li>
        ))}
    </ul>
  );
}
