'use client';

import { useId, useState } from 'react';
import { bn, cn, latin } from '@/lib/utils';
import { Field, type FieldBaseProps } from './Field';

/**
 * 4–6 digit PIN that replaces accounts on community posts.
 * One real input sits over the boxes, so typing, paste, backspace and one-time-code autofill
 * all behave natively; the boxes only draw what it holds, in Bangla digits.
 */
export function PinInput({
  length = 4,
  value,
  onChange,
  onComplete,
  mask,
  ...field
}: FieldBaseProps & {
  /** Boxes to draw: 4 when setting a PIN, 6 when entering one (accepts 4–6). */
  length?: 4 | 5 | 6;
  value: string;
  onChange: (pin: string) => void;
  onComplete?: (pin: string) => void;
  mask?: boolean;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const max = mask ? 6 : length;

  return (
    <Field id={id} {...field}>
      <div className="relative inline-flex">
        <div className="bb-pin" aria-hidden>
          {Array.from({ length: Math.max(length, value.length) }, (_, i) => {
            const ch = value.charAt(i);
            const active = focused && i === Math.min(value.length, max - 1);
            return (
              <span key={i} className={cn('bb-pin-cell grid place-items-center', ch && 'is-filled', active && 'outline-2 outline-offset-2 outline-[var(--focus)]')}>
                {ch ? (mask ? '•' : bn(ch)) : ''}
              </span>
            );
          })}
        </div>
        <input
          id={id}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9০-৯]*"
          maxLength={max}
          value={value}
          aria-invalid={!!field.error}
          aria-required={field.required}
          aria-describedby={field.error ? `${id}-e` : field.hint ? `${id}-h` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const v = latin(e.target.value).replace(/\D/g, '').slice(0, max);
            onChange(v);
            if (v.length === length) onComplete?.(v);
          }}
        />
      </div>
    </Field>
  );
}
