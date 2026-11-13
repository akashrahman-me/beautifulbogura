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
import { useCreateListing } from '../hooks/useListings';
import { CONDITIONS, createListingSchema, LISTING_CATEGORIES, LISTING_STEP_1, type CreateListingIn, type CreateListingInput } from '../schemas/listing.schema';

export function ListingForm() {
  const create = useCreateListing();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const form = useForm<CreateListingIn, unknown, CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: { title: '', price: '', description: '', images: [], sellerName: '', phone: '', whatsapp: true, address: '', website: '' },
  });
  const { errors } = form.formState;

  const next = async () => {
    if (await form.trigger([...LISTING_STEP_1])) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const submit = form.handleSubmit(
    (v) => create.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }),
    (errs) => {
      if (LISTING_STEP_1.some((k) => k in errs)) setStep(0);
    },
  );

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="কেনাবেচা" title="বিক্রির বিজ্ঞাপন দিন" back={{ href: '/buy-sell', label: 'কেনাবেচা' }} />
      {done ? (
        <PostedSuccess title="বিজ্ঞাপন প্রকাশিত হয়েছে" href="/buy-sell" listLabel="কেনাবেচা দেখুন" />
      ) : (
        <RequireSignIn>
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <FormSteps steps={['পণ্যের তথ্য', 'বিক্রেতার তথ্য']} current={step} />
            <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5" hidden={step !== 0}>
              <legend className="text-h4 px-1">পণ্যের তথ্য</legend>
              <Select label="ক্যাটাগরি" required placeholder="বেছে নিন" defaultValue="" options={LISTING_CATEGORIES.map(([value, label]) => ({ value, label }))} {...form.register('category')} error={errors.category?.message} />
              <TextField label="পণ্যের নাম" required placeholder="যেমন: Samsung Galaxy A54 (৮/২৫৬)" {...form.register('title')} error={errors.title?.message} />
              <Controller
                control={form.control}
                name="condition"
                render={({ field }) => <ChoiceGroup required label="অবস্থা" options={CONDITIONS.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.condition?.message} />}
              />
              <TextField label="দাম" required prefix="৳" inputMode="numeric" {...form.register('price')} error={errors.price?.message} />
              <TextArea label="বিবরণ" required rows={4} placeholder="কতদিন ব্যবহার, কী কী সাথে আছে, কোনো সমস্যা আছে কিনা" {...form.register('description')} error={errors.description?.message} />
              <Controller control={form.control} name="images" render={({ field }) => <FileDrop label="ছবি" optional max={5} value={field.value} onChange={field.onChange} />} />
              <Button iconRight="arrow-right" size="lg" block onClick={next}>
                পরের ধাপ
              </Button>
            </fieldset>

            <fieldset className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5" hidden={step !== 1}>
              <legend className="text-h4 px-1">বিক্রেতার তথ্য</legend>
              <TextField label="আপনার নাম" required {...form.register('sellerName')} error={errors.sellerName?.message} />
              <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
              <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
              <TextField label="এলাকা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
              {errors.root && <Alert tone="danger" title={errors.root.message} />}
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button variant="secondary" iconLeft="arrow-left" onClick={() => setStep(0)}>
                  আগের ধাপ
                </Button>
                <Button type="submit" size="lg" block loading={create.isPending} iconLeft="check">
                  বিজ্ঞাপন প্রকাশ করুন
                </Button>
              </div>
            </fieldset>
          </form>
        </RequireSignIn>
      )}
    </div>
  );
}
