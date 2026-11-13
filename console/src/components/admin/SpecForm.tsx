'use client';

import { Fragment, type ReactNode } from 'react';
import { Controller, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Checkbox, Select, TextArea, TextField } from '@/components/ui/Field';
import { FileDrop } from '@/components/ui/FileDrop';
import { ChoiceGroup } from '@/components/ui/Interactive';

export type Option = { value: string; label: string };

/**
 * One form field described as data. Values are kept as the inputs give them (strings, booleans,
 * string arrays, File[] for photos); the module's Zod schema turns them into the API shape.
 */
export interface FieldSpec {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'choice' | 'multi' | 'checkbox' | 'date' | 'number' | 'phone' | 'url' | 'email' | 'image' | 'custom';
  /** For `type: 'custom'`: render anything bound to the form (repeatable groups, editors). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each module binds its own form shape
  render?: (form: UseFormReturn<any, unknown, any>) => ReactNode;
  options?: readonly Option[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  rows?: number;
  /** Take the full width in the two-column grid. */
  wide?: boolean;
  /** Group heading drawn above this field. */
  section?: string;
}

/** Renders a list of FieldSpecs bound to a react-hook-form instance, in a responsive two-column grid. */
export function SpecForm<T extends FieldValues, O = T>({ form, fields }: { form: UseFormReturn<T, unknown, O>; fields: FieldSpec[] }) {
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        const name = f.name as Path<T>;
        const err = errors[f.name]?.message;
        const common = { label: f.label, required: f.required, optional: !f.required && f.type !== 'checkbox', hint: f.hint, error: err };
        const wide = f.wide || ['textarea', 'choice', 'multi', 'image', 'custom'].includes(f.type);
        let el;
        switch (f.type) {
          case 'textarea':
            el = <TextArea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} {...form.register(name)} />;
            break;
          case 'select':
            el = <Select {...common} placeholder={f.placeholder ?? 'বেছে নিন'} options={[...(f.options ?? [])]} {...form.register(name)} />;
            break;
          case 'choice':
            el = <Controller control={form.control} name={name} render={({ field }) => <ChoiceGroup {...common} options={[...(f.options ?? [])]} value={(field.value as string) ?? ''} onChange={field.onChange} />} />;
            break;
          case 'multi':
            el = <Controller control={form.control} name={name} render={({ field }) => <ChoiceGroup {...common} multiple options={[...(f.options ?? [])]} value={(field.value as string[]) ?? []} onChange={field.onChange} />} />;
            break;
          case 'checkbox':
            el = <Controller control={form.control} name={name} render={({ field }) => <Checkbox label={f.label} description={f.hint} checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />;
            break;
          case 'custom':
            el = f.render?.(form);
            break;
          case 'image':
            el = (
              <Controller
                control={form.control}
                name={name}
                render={({ field }) => (
                  <div className="flex flex-col gap-3">
                    {typeof field.value === 'string' && field.value && (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- stored upload URL */}
                        <img src={field.value} alt="" className="size-16 rounded-md border border-line object-cover" />
                        <button type="button" className="bb-linkbtn bb-linkbtn-muted" onClick={() => field.onChange(null)}>
                          ছবি সরান
                        </button>
                      </div>
                    )}
                    <FileDrop {...common} max={1} value={Array.isArray(field.value) ? (field.value as File[]) : []} onChange={(files) => field.onChange(files.length ? files : null)} />
                  </div>
                )}
              />
            );
            break;
          default:
            el = (
              <TextField
                {...common}
                type={f.type === 'phone' ? 'tel' : f.type === 'number' ? 'text' : f.type}
                inputMode={f.type === 'phone' ? 'tel' : f.type === 'number' ? 'numeric' : undefined}
                icon={f.type === 'phone' ? 'phone' : undefined}
                placeholder={f.placeholder}
                {...form.register(name)}
              />
            );
        }
        return (
          <Fragment key={f.name}>
            {f.section && <h3 className="text-h4 border-t border-line pt-4 sm:col-span-2">{f.section}</h3>}
            <div className={cn(wide && 'sm:col-span-2')}>{el}</div>
          </Fragment>
        );
      })}
    </div>
  );
}
