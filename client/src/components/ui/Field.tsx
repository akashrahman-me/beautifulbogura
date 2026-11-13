'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

export interface FieldBaseProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
}

/** Label above, hint or error below. Errors say what to do. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: FieldBaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn('bb-field', error && 'has-error', className)}>
      {label && (
        <label className="bb-label" htmlFor={id}>
          {label}
          {required && <span className="bb-req" aria-hidden> *</span>}
          {optional && <span className="bb-opt"> (ঐচ্ছিক)</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="bb-field-error" id={`${id}-e`} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : hint ? (
        <p className="bb-field-hint" id={`${id}-h`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: ReactNode, hint?: ReactNode) => (error ? `${id}-e` : hint ? `${id}-h` : undefined);

type TextFieldProps = FieldBaseProps &
  Omit<ComponentProps<'input'>, 'prefix' | 'className'> & {
    prefix?: ReactNode;
    suffix?: ReactNode;
    icon?: IconName;
  };

export function TextField({ label, hint, error, required, optional, className, prefix, suffix, icon, id: idProp, ...input }: TextFieldProps) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="bb-input">
        {icon && <Icon name={icon} size={20} className="bb-input-icon" />}
        {prefix && <span className="bb-input-affix">{prefix}</span>}
        <input
          id={id}
          className="bb-input-el"
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy(id, error, hint)}
          {...input}
        />
        {suffix && <span className="bb-input-affix">{suffix}</span>}
      </div>
    </Field>
  );
}

export function TextArea({ label, hint, error, required, optional, className, rows = 4, id: idProp, ...input }: FieldBaseProps & Omit<ComponentProps<'textarea'>, 'className'>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="bb-input bb-input-multi">
        <textarea id={id} rows={rows} className="bb-input-el" aria-invalid={!!error} aria-required={required} aria-describedby={describedBy(id, error, hint)} {...input} />
      </div>
    </Field>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  label,
  hint,
  error,
  required,
  optional,
  className,
  options,
  placeholder,
  id: idProp,
  ...select
}: FieldBaseProps & Omit<ComponentProps<'select'>, 'className'> & { options: (string | SelectOption)[]; placeholder?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      <div className="bb-input bb-select">
        <select id={id} className="bb-input-el" aria-invalid={!!error} aria-required={required} aria-describedby={describedBy(id, error, hint)} {...select}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          })}
        </select>
        <Icon name="chevron-down" size={18} className="bb-select-caret" />
      </div>
    </Field>
  );
}

export function Checkbox({ label, description, className, ...input }: { label: ReactNode; description?: ReactNode; className?: string } & Omit<ComponentProps<'input'>, 'type' | 'className'>) {
  return (
    <label className={cn('bb-check', input.disabled && 'is-disabled', className)}>
      <input type="checkbox" className="bb-check-input" {...input} />
      <span className="bb-check-box" aria-hidden>
        <Icon name="check" size={16} strokeWidth={2.5} />
      </span>
      <span className="bb-check-text">
        <span className="bb-check-label">{label}</span>
        {description && <span className="bb-check-desc">{description}</span>}
      </span>
    </label>
  );
}
