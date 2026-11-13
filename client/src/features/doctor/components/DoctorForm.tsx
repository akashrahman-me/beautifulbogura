'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { bn, WEEKDAYS_SHORT } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, TextField } from '@/components/ui/Field';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert } from '@/components/ui/Misc';
import { PageHeader } from '@/components/shared/Blocks';
import { useCreateDoctor } from '../hooks/useDoctors';
import { createDoctorSchema, DEGREES, SPECIALTIES, type CreateDoctorIn, type CreateDoctorInput } from '../schemas/doctor.schema';

const DAY_OPTIONS = [6, 0, 1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: WEEKDAYS_SHORT[d] }));
const emptyChamber = { hospital: '', days: [] as number[], time: '', serial: '', fee: '' };

export function DoctorForm() {
  const create = useCreateDoctor();
  const [done, setDone] = useState(false);
  const form = useForm<CreateDoctorIn, unknown, CreateDoctorInput>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: { name: '', specialty: '', specialtyOther: '', degrees: [], degreesOther: '', phone: '', chambers: [emptyChamber], website: '' },
  });
  const chambers = useFieldArray({ control: form.control, name: 'chambers' });
  const { errors } = form.formState;
  const specialty = useWatch({ control: form.control, name: 'specialty' });
  const degrees = useWatch({ control: form.control, name: 'degrees' });

  const onSubmit = form.handleSubmit((values) => create.mutate(values, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));

  if (done) {
    return (
      <div className="container-narrow flex flex-col gap-5">
        <PageHeader title="ডাক্তার যুক্ত করুন" back={{ href: '/doctors', label: 'ডাক্তারদের তালিকা' }} />
        <Alert tone="success" title="ধন্যবাদ! তথ্য জমা হয়েছে" action={<Button href="/doctors" size="sm" variant="secondary">তালিকায় ফিরে যান</Button>}>
          অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader title="ডাক্তার যুক্ত করুন" back={{ href: '/doctors', label: 'ডাক্তারদের তালিকা' }} meta={<Badge tone="info" icon="verified">অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে</Badge>} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
          <legend className="text-h4 px-1">ডাক্তারের তথ্য</legend>
          <TextField label="নাম" required placeholder="ডা. …" {...form.register('name')} error={errors.name?.message} />
          <Select label="বিশেষজ্ঞতা" required placeholder="বেছে নিন" options={SPECIALTIES} {...form.register('specialty')} error={errors.specialty?.message} />
          {specialty === 'অন্যান্য' && <TextField label="বিশেষজ্ঞতা লিখুন" required {...form.register('specialtyOther')} error={errors.specialtyOther?.message} />}
          <Controller
            control={form.control}
            name="degrees"
            render={({ field }) => (
              <ChoiceGroup multiple label="ডিগ্রি" options={DEGREES.map((d) => ({ value: d, label: d }))} value={field.value} onChange={field.onChange} />
            )}
          />
          {degrees.includes('অন্যান্য') && <TextField label="অন্যান্য ডিগ্রি" placeholder="যেমন: এফসিপিএস, এমডি" {...form.register('degreesOther')} />}
          <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
        </fieldset>

        {chambers.fields.map((f, i) => (
          <fieldset key={f.id} className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <legend className="text-h4">চেম্বার {bn(i + 1)}</legend>
              {chambers.fields.length > 1 && (
                <Button variant="danger-ghost" size="sm" iconLeft="trash" onClick={() => chambers.remove(i)}>
                  সরান
                </Button>
              )}
            </div>
            <TextField label="হাসপাতাল বা চেম্বার" required {...form.register(`chambers.${i}.hospital`)} error={errors.chambers?.[i]?.hospital?.message} />
            <Controller
              control={form.control}
              name={`chambers.${i}.days`}
              render={({ field }) => (
                <ChoiceGroup
                  multiple
                  required
                  label="যে দিনগুলোতে বসেন"
                  options={DAY_OPTIONS}
                  value={field.value.map(String)}
                  onChange={(v) => field.onChange(v.map(Number))}
                  error={errors.chambers?.[i]?.days?.message}
                />
              )}
            />
            <TextField label="সময়" required placeholder="বিকেল ৪টা – রাত ৯টা" {...form.register(`chambers.${i}.time`)} error={errors.chambers?.[i]?.time?.message} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="সিরিয়াল নম্বর" optional inputMode="tel" {...form.register(`chambers.${i}.serial`)} />
              <TextField label="ফি" optional prefix="৳" inputMode="numeric" {...form.register(`chambers.${i}.fee`)} />
            </div>
          </fieldset>
        ))}
        {errors.chambers?.root?.message && <Alert tone="danger" title={errors.chambers.root.message} />}
        <Button variant="secondary" iconLeft="plus" onClick={() => chambers.append(emptyChamber)} className="self-start">
          আরেকটি চেম্বার যুক্ত করুন
        </Button>

        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
        {errors.root && <Alert tone="danger" title={errors.root.message} />}
        <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
          জমা দিন
        </Button>
      </form>
    </div>
  );
}
