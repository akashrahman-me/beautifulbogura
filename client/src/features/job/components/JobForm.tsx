'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { bn } from '@/lib/utils';
import { PIN_HINT } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Checkbox, TextArea, TextField } from '@/components/ui/Field';
import { FileDrop } from '@/components/ui/FileDrop';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert } from '@/components/ui/Misc';
import { PinInput } from '@/components/ui/PinInput';
import { PageHeader } from '@/components/shared/Blocks';
import { PostedSuccess } from '@/components/shared/PostedSuccess';
import { useCreateJob } from '../hooks/useJobs';
import { createJobSchema, DURATIONS, type CreateJobIn, type CreateJobInput } from '../schemas/job.schema';

export function JobForm() {
  const create = useCreateJob();
  const [done, setDone] = useState<string | null>(null);
  const form = useForm<CreateJobIn, unknown, CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { company: '', title: '', vacancies: '1', salary: '', deadline: '', education: '', details: '', phone: '', whatsapp: true, address: '', duration: '15', pin: '', images: [], website: '' },
  });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => create.mutate(v, { onSuccess: () => setDone(`${bn(v.duration)} দিন`), onError: (e) => applyApiErrors(form, e) }));

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="চাকরির খবর" title="চাকরির বিজ্ঞাপন দিন" back={{ href: '/jobs', label: 'চাকরির খবর' }} description="কোনো অ্যাকাউন্ট লাগে না। সাথে সাথে প্রকাশিত হবে।" />
      {done ? (
        <PostedSuccess title="বিজ্ঞাপন প্রকাশিত হয়েছে" href="/jobs" listLabel="চাকরির খবর দেখুন" days={done} />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <legend className="text-h4 px-1">পদের তথ্য</legend>
            <TextField label="প্রতিষ্ঠানের নাম" required {...form.register('company')} error={errors.company?.message} />
            <TextField label="পদের নাম" required placeholder="যেমন: সেলস এক্সিকিউটিভ" {...form.register('title')} error={errors.title?.message} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="পদ সংখ্যা" required inputMode="numeric" {...form.register('vacancies')} error={errors.vacancies?.message} />
              <TextField label="বেতন" required placeholder="৳ ১৫,০০০ – ২০,০০০" {...form.register('salary')} error={errors.salary?.message} />
            </div>
            <TextField label="আবেদনের শেষ তারিখ" required type="date" {...form.register('deadline')} error={errors.deadline?.message} />
            <TextField label="শিক্ষাগত যোগ্যতা" optional placeholder="যেমন: এইচএসসি" {...form.register('education')} />
            <TextArea label="কাজ, অভিজ্ঞতা ও বিস্তারিত" required rows={5} {...form.register('details')} error={errors.details?.message} />
            <Controller control={form.control} name="images" render={({ field }) => <FileDrop label="ছবি বা সার্কুলার" optional max={1} value={field.value ?? []} onChange={field.onChange} />} />
          </fieldset>

          <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <legend className="text-h4 px-1">যোগাযোগ</legend>
            <TextField label="যোগাযোগের নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
            <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
            <TextField label="ঠিকানা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
          </fieldset>

          <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
            <legend className="text-h4 px-1">প্রকাশ ও পিন</legend>
            <Controller
              control={form.control}
              name="duration"
              render={({ field }) => <ChoiceGroup required label="বিজ্ঞাপনের মেয়াদ" options={DURATIONS.map((d) => ({ value: d, label: `${bn(d)} দিন` }))} value={field.value} onChange={field.onChange} />}
            />
            <Controller control={form.control} name="pin" render={({ field }) => <PinInput required label="একটি পিন ঠিক করুন" length={4} value={field.value} onChange={field.onChange} hint={PIN_HINT} error={errors.pin?.message} />} />
          </fieldset>

          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
            বিজ্ঞাপন প্রকাশ করুন
          </Button>
        </form>
      )}
    </div>
  );
}
