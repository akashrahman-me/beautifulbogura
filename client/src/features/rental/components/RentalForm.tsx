'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { Button } from '@/components/ui/Button';
import { Checkbox, Select, TextArea, TextField } from '@/components/ui/Field';
import { FileDrop } from '@/components/ui/FileDrop';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert, FormSteps } from '@/components/ui/Misc';
import { RequireSignIn } from '@/features/auth';
import { PageHeader } from '@/components/shared/Blocks';
import { PostedSuccess } from '@/components/shared/PostedSuccess';
import { useCreateRental } from '../hooks/useRentals';
import { createRentalSchema, RENTAL_STEPS, RENTAL_TYPES, type CreateRentalIn, type CreateRentalInput } from '../schemas/rental.schema';

const STEP_LABELS = ['মালিকের তথ্য', 'বাসার বিবরণ', 'ছবি'];

export function RentalForm() {
  const create = useCreateRental();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const form = useForm<CreateRentalIn, unknown, CreateRentalInput>({
    resolver: zodResolver(createRentalSchema),
    defaultValues: { ownerName: '', phone: '', whatsapp: true, rent: '', rooms: '1', gas: false, attachedBath: false, title: '', description: '', address: '', mapUrl: '', images: [], website: '' },
  });
  const { errors } = form.formState;

  const go = async (to: number) => {
    if (to > step && !(await form.trigger([...RENTAL_STEPS[step]]))) return;
    setStep(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const submit = form.handleSubmit(
    (v) => create.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }),
    (errs) => {
      const first = RENTAL_STEPS.findIndex((keys) => keys.some((k) => k in errs));
      if (first >= 0) setStep(first);
    },
  );

  const card = 'flex flex-col gap-5 rounded-lg border border-line bg-surface p-5';

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="বাসা ভাড়া" title="বাসার বিজ্ঞাপন দিন" back={{ href: '/to-let', label: 'বাসা ভাড়া' }} description="তিন ধাপে শেষ। বিজ্ঞাপন ৩০ দিন দেখা যাবে।" />
      {done ? (
        <PostedSuccess title="বাসা ভাড়ার বিজ্ঞাপন প্রকাশিত হয়েছে" href="/to-let" listLabel="বাসা ভাড়া দেখুন" days="৩০ দিন" />
      ) : (
        <RequireSignIn>
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <FormSteps steps={STEP_LABELS} current={step} />

            <fieldset className={card} hidden={step !== 0}>
              <legend className="text-h4 px-1">মালিকের তথ্য</legend>
              <TextField label="মালিকের নাম" required {...form.register('ownerName')} error={errors.ownerName?.message} />
              <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
              <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
            </fieldset>

            <fieldset className={card} hidden={step !== 1}>
              <legend className="text-h4 px-1">বাসার বিবরণ</legend>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => <ChoiceGroup required label="ধরন" options={RENTAL_TYPES.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.type?.message} />}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="মাসিক ভাড়া" required prefix="৳" suffix="/মাস" inputMode="numeric" {...form.register('rent')} error={errors.rent?.message} />
                <Select label="রুম" required options={Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `${'১২৩৪৫৬৭৮'[i]} রুম` }))} {...form.register('rooms')} error={errors.rooms?.message} />
              </div>
              <div className="flex flex-col">
                <Controller control={form.control} name="gas" render={({ field }) => <Checkbox label="গ্যাস সংযোগ আছে" description="লাইনের গ্যাস; সিলিন্ডার হলে বিবরণে লিখুন" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                <Controller control={form.control} name="attachedBath" render={({ field }) => <Checkbox label="অ্যাটাচড বাথরুম" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
              </div>
              <TextField label="শিরোনাম" required placeholder="২ রুমের ফ্ল্যাট, মালতীনগর" {...form.register('title')} error={errors.title?.message} />
              <TextArea label="বিস্তারিত" optional rows={3} placeholder="তলা, কবে থেকে উঠতে পারবেন, কার জন্য উপযুক্ত" {...form.register('description')} />
              <TextField label="ঠিকানা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
              <TextField label="গুগল ম্যাপস লিংক" optional type="url" placeholder="https://maps.google.com/…" {...form.register('mapUrl')} error={errors.mapUrl?.message} />
            </fieldset>

            <fieldset className={card} hidden={step !== 2}>
              <legend className="text-h4 px-1">ছবি</legend>
              <Controller control={form.control} name="images" render={({ field }) => <FileDrop label="বাসার ছবি" optional max={5} value={field.value} onChange={field.onChange} hint="ছবিসহ বিজ্ঞাপনে বেশি সাড়া পাওয়া যায়।" />} />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
              {errors.root && <Alert tone="danger" title={errors.root.message} />}
            </fieldset>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {step > 0 && (
                <Button variant="secondary" iconLeft="arrow-left" onClick={() => go(step - 1)}>
                  আগের ধাপ
                </Button>
              )}
              {step < 2 ? (
                // Distinct keys: reusing one <button> and flipping it to type="submit" mid-click submits the form.
                <Button key="next" size="lg" block iconRight="arrow-right" onClick={() => go(step + 1)}>
                  পরের ধাপ
                </Button>
              ) : (
                <Button key="submit" type="submit" size="lg" block loading={create.isPending} iconLeft="check">
                  বিজ্ঞাপন প্রকাশ করুন
                </Button>
              )}
            </div>
          </form>
        </RequireSignIn>
      )}
    </div>
  );
}
