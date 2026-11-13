'use client';

import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { bn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { DAYS } from '@/config/catalog';

type ChamberErrors = { hospital?: { message?: string }; days?: { message?: string }; time?: { message?: string }; serial?: { message?: string } }[] & { message?: string; root?: { message?: string } };

/** Repeatable chamber rows: hospital, days, time, serial number, fee. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- bound to the doctor form
export function ChambersField({ form }: { form: UseFormReturn<any, unknown, any> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'chambers' });
  const errors = form.formState.errors.chambers as ChamberErrors | undefined;
  return (
    <div className="flex flex-col gap-4">
      {fields.map((f, i) => (
        <fieldset key={f.id} className="flex flex-col gap-4 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between">
            <legend className="text-label">চেম্বার {bn(i + 1)}</legend>
            {fields.length > 1 && <IconButton icon="trash" label={`চেম্বার ${bn(i + 1)} সরান`} size="sm" onClick={() => remove(i)} />}
          </div>
          <TextField label="হাসপাতাল বা চেম্বার" required {...form.register(`chambers.${i}.hospital`)} error={errors?.[i]?.hospital?.message} />
          <Controller control={form.control} name={`chambers.${i}.days`} render={({ field }) => <ChoiceGroup label="দিন" required multiple options={DAYS} value={field.value ?? []} onChange={field.onChange} error={errors?.[i]?.days?.message} />} />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField label="সময়" required placeholder="বিকেল ৪টা – রাত ৯টা" {...form.register(`chambers.${i}.time`)} error={errors?.[i]?.time?.message} />
            <TextField label="সিরিয়ালের নম্বর" type="tel" inputMode="tel" {...form.register(`chambers.${i}.serial`)} error={errors?.[i]?.serial?.message} />
            <TextField label="ফি (৳)" inputMode="numeric" {...form.register(`chambers.${i}.fee`)} />
          </div>
        </fieldset>
      ))}
      {(errors?.message || errors?.root?.message) && <p className="bb-field-error">{errors.message ?? errors.root?.message}</p>}
      <Button variant="secondary" iconLeft="plus" className="self-start" onClick={() => append({ hospital: '', days: [], time: '', serial: '', fee: '' })}>
        চেম্বার যুক্ত করুন
      </Button>
    </div>
  );
}
