'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { bn, cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';

export interface SubField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'phone';
  placeholder?: string;
  wide?: boolean;
}

type RowErrors = Record<string, { message?: string } | undefined>[] & { message?: string; root?: { message?: string } };

/** A list of small records (stats, contacts, sections, wards): add, remove, reorder. */
export function RepeatField({
  form,
  name,
  label,
  fields,
  empty,
  addLabel,
  itemLabel,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bound to each module's form
  form: UseFormReturn<any, unknown, any>;
  name: string;
  label: string;
  fields: SubField[];
  empty: Record<string, string>;
  addLabel: string;
  itemLabel: string;
}) {
  const { fields: rows, append, remove, move } = useFieldArray({ control: form.control, name });
  const errors = form.formState.errors[name] as RowErrors | undefined;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="bb-label pb-2">{label}</legend>
      {rows.map((r, i) => (
        <div key={r.id} className="flex flex-col gap-3 rounded-lg border border-line p-4">
          <div className="flex items-center gap-1">
            <span className="text-label mr-auto">
              {itemLabel} {bn(i + 1)}
            </span>
            <IconButton icon="chevron-up" label="উপরে নিন" size="sm" disabled={i === 0} onClick={() => move(i, i - 1)} />
            <IconButton icon="chevron-down" label="নিচে নিন" size="sm" disabled={i === rows.length - 1} onClick={() => move(i, i + 1)} />
            <IconButton icon="trash" label={`${itemLabel} ${bn(i + 1)} সরান`} size="sm" onClick={() => remove(i)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const err = errors?.[i]?.[f.name]?.message;
              const reg = form.register(`${name}.${i}.${f.name}`);
              return f.type === 'textarea' ? (
                <TextArea key={f.name} className="sm:col-span-2" label={f.label} rows={4} placeholder={f.placeholder} error={err} {...reg} />
              ) : (
                <TextField key={f.name} className={cn(f.wide && 'sm:col-span-2')} label={f.label} type={f.type === 'phone' ? 'tel' : 'text'} inputMode={f.type === 'phone' ? 'tel' : undefined} placeholder={f.placeholder} error={err} {...reg} />
              );
            })}
          </div>
        </div>
      ))}
      {(errors?.message || errors?.root?.message) && <p className="bb-field-error">{errors.message ?? errors.root?.message}</p>}
      <Button variant="secondary" iconLeft="plus" className="self-start" onClick={() => append(empty)}>
        {addLabel}
      </Button>
    </fieldset>
  );
}
