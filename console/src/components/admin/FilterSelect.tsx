'use client';

import { Icon } from '@/components/ui/Icon';

/** Compact labelled select for toolbars. Empty value = “সব”. */
export function FilterSelect<V extends string>({ label, value, onChange, options, allLabel = 'সব' }: { label: string; value: V | '' | null | undefined; onChange: (v: V | null) => void; options: readonly { value: V; label: string }[]; allLabel?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-caption font-semibold text-ink-muted">{label}</span>
      <span className="bb-input bb-select min-w-40">
        <select className="bb-input-el" value={value ?? ''} onChange={(e) => onChange((e.target.value || null) as V | null)}>
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={18} className="bb-select-caret" />
      </span>
    </label>
  );
}
