'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert } from '@/components/ui/Misc';
import { PageHeader } from '@/components/shared/Blocks';
import { useRegisterDonor } from '../hooks/useDonors';
import { BLOOD_GROUPS, registerDonorSchema, type RegisterDonorIn, type RegisterDonorInput } from '../schemas/donor.schema';

export function RegisterDonorForm() {
  const register = useRegisterDonor();
  const [done, setDone] = useState(false);
  const form = useForm<RegisterDonorIn, unknown, RegisterDonorInput>({
    resolver: zodResolver(registerDonorSchema),
    defaultValues: { name: '', phone: '', lastDonation: '', address: '', website: '' },
  });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => register.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="রক্ত ব্যাংক" title="রক্তদাতা হোন" back={{ href: '/blood-bank', label: 'রক্ত ব্যাংক' }} meta={<Badge tone="neutral" icon="lock">নম্বরটি শুধু রক্তের প্রয়োজনে দেখানো হবে</Badge>} />
      {done ? (
        <Alert tone="success" title="নিবন্ধন সম্পন্ন হয়েছে। ধন্যবাদ!" action={<Button href="/blood-bank" size="sm" variant="secondary">দাতার তালিকা দেখুন</Button>}>
          রক্ত দেওয়ার পর তালিকা থেকে ‘তারিখ হালনাগাদ’ করতে ভুলবেন না।
        </Alert>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
          <TextField label="নাম" required {...form.register('name')} error={errors.name?.message} />
          <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
          <Controller
            control={form.control}
            name="group"
            render={({ field }) => (
              <ChoiceGroup required label="রক্তের গ্রুপ" options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))} value={field.value ?? ''} onChange={field.onChange} error={errors.group?.message} />
            )}
          />
          <TextField label="শেষ রক্তদানের তারিখ" optional type="date" hint="কখনো রক্ত না দিয়ে থাকলে খালি রাখুন।" {...form.register('lastDonation')} error={errors.lastDonation?.message} />
          <TextField label="এলাকা / ঠিকানা" required icon="pin" placeholder="যেমন: মালতীনগর" {...form.register('address')} error={errors.address?.message} />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" variant="emergency" size="lg" block loading={register.isPending} iconLeft="drop">
            নিবন্ধন করুন
          </Button>
        </form>
      )}
    </div>
  );
}
