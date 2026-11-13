'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { applyApiErrors } from '@/lib/form';
import { Button } from '@/components/ui/Button';
import { Checkbox, TextArea, TextField } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Misc';
import { PageHeader } from '@/components/shared/Blocks';
import { useAddDirectoryEntry } from '../hooks/useDirectory';
import { addEntrySchema, DIRECTORY_TYPES } from '../schemas/directory.schema';

type FormIn = z.input<typeof addEntrySchema>;
type FormOut = z.output<typeof addEntrySchema>;

/** “Add your info” for a directory type. Published after admin verification. */
export function AddEntryForm({ type }: { type: string }) {
  const config = DIRECTORY_TYPES[type];
  const add = useAddDirectoryEntry(type);
  const [done, setDone] = useState(false);
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(addEntrySchema),
    defaultValues: { name: '', role: '', phone: '', whatsapp: false, address: '', description: '', website: '' },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    add.mutate(values, {
      onSuccess: () => setDone(true),
      onError: (e) => applyApiErrors(form, e),
    }),
  );

  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader title="তথ্য যুক্ত করুন" eyebrow={config.title} back={{ href: `/directory/${type}`, label: config.title }} description="অ্যাডমিন যাচাই করে প্রকাশ করবেন। সাধারণত ২৪ ঘণ্টার মধ্যে।" />
      {done ? (
        <Alert
          tone="success"
          title="ধন্যবাদ! আপনার তথ্য জমা হয়েছে"
          action={
            <Button href={`/directory/${type}`} variant="secondary" size="sm">
              তালিকায় ফিরে যান
            </Button>
          }
        >
          অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
          <TextField label="নাম" required {...form.register('name')} error={errors.name?.message} />
          <TextField label="পদবি বা ধরন" optional placeholder="যেমন: আইনজীবী · জজ কোর্ট" {...form.register('role')} error={errors.role?.message} />
          <TextField label="মোবাইল নম্বর" required inputMode="tel" icon="phone" placeholder="০১৭০০০০০০০০" {...form.register('phone')} error={errors.phone?.message} />
          <Controller control={form.control} name="whatsapp" render={({ field }) => <Checkbox label="এই নম্বরে হোয়াটসঅ্যাপ আছে" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
          <TextField label="ঠিকানা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
          <TextArea label="বিস্তারিত" optional rows={3} {...form.register('description')} error={errors.description?.message} />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" block size="lg" loading={add.isPending} iconLeft="check">
            জমা দিন
          </Button>
        </form>
      )}
    </div>
  );
}
