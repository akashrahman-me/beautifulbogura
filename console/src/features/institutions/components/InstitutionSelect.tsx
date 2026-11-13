'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Select } from '@/components/ui/Field';
import { institutions } from './resources';

/** Institution picker for notices: loads names from the API (up to 500). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- bound to the notice form
export function InstitutionSelect({ form }: { form: UseFormReturn<any, unknown, any> }) {
  const list = institutions.useList({ limit: 500, sort: 'name' });
  const err = form.formState.errors.institutionId?.message as string | undefined;
  return (
    <Select
      label="প্রতিষ্ঠান"
      required
      placeholder={list.isPending ? 'লোড হচ্ছে…' : 'বেছে নিন'}
      options={(list.data?.items ?? []).map((i) => ({ value: i.id, label: i.name }))}
      error={err}
      {...form.register('institutionId')}
    />
  );
}
