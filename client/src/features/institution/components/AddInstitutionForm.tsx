'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { applyApiErrors } from '@/lib/form';
import { Button } from '@/components/ui/Button';
import { TextArea, TextField } from '@/components/ui/Field';
import { ChoiceGroup } from '@/components/ui/Interactive';
import { Alert } from '@/components/ui/Misc';
import { PageHeader } from '@/components/shared/Blocks';
import { useAddInstitution } from '../hooks/useInstitutions';
import { addInstitutionSchema, INSTITUTION_TYPES, type AddInstitutionIn, type AddInstitutionInput } from '../schemas/institution.schema';

export function AddInstitutionForm() {
  const add = useAddInstitution();
  const [done, setDone] = useState(false);
  const form = useForm<AddInstitutionIn, unknown, AddInstitutionInput>({
    resolver: zodResolver(addInstitutionSchema),
    defaultValues: { name: '', eiin: '', founder: '', established: '', union: '', phone: '', address: '', site: '', about: '', submitter: '', website: '' },
  });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => add.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  return (
    <div className="container-narrow flex flex-col gap-5">
      <PageHeader eyebrow="শিক্ষা" title="প্রতিষ্ঠান যুক্ত করুন" back={{ href: '/education', label: 'শিক্ষা প্রতিষ্ঠান' }} description="অ্যাডমিন যাচাইয়ের পর প্রকাশিত হবে।" />
      {done ? (
        <Alert tone="success" title="ধন্যবাদ! তথ্য জমা হয়েছে" action={<Button href="/education" size="sm" variant="secondary">তালিকায় ফিরে যান</Button>} />
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5">
          <TextField label="প্রতিষ্ঠানের নাম" required {...form.register('name')} error={errors.name?.message} />
          <Controller control={form.control} name="type" render={({ field }) => <ChoiceGroup required label="ধরন" options={INSTITUTION_TYPES.map(([value, label]) => ({ value, label }))} value={field.value ?? ''} onChange={field.onChange} error={errors.type?.message} />} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="ইআইআইএন" optional inputMode="numeric" {...form.register('eiin')} error={errors.eiin?.message} />
            <TextField label="প্রতিষ্ঠা" optional placeholder="সাল বা পুরো তারিখ" {...form.register('established')} />
          </div>
          <TextField label="প্রতিষ্ঠাতা" optional {...form.register('founder')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="ইউনিয়ন" optional {...form.register('union')} />
            <TextField label="ফোন" optional inputMode="tel" {...form.register('phone')} error={errors.phone?.message} />
          </div>
          <TextField label="ঠিকানা" required icon="pin" {...form.register('address')} error={errors.address?.message} />
          <TextField label="ওয়েবসাইট" optional type="url" placeholder="https://" {...form.register('site')} error={errors.site?.message} />
          <TextArea label="পরিচিতি" optional rows={4} {...form.register('about')} />
          <TextField label="আপনার নাম" required hint="যাচাইয়ের প্রয়োজনে" {...form.register('submitter')} error={errors.submitter?.message} />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" size="lg" block loading={add.isPending} iconLeft="check">
            জমা দিন
          </Button>
        </form>
      )}
    </div>
  );
}
