import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/shared/Skeleton';
import { DoctorForm } from '@/features/doctor';

export const metadata: Metadata = { title: 'ডাক্তার যুক্ত করুন' };

// useFieldArray creates random ids for chamber rows, so the form renders at request time.
export default function NewDoctorPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={8} />}>
      <DoctorForm />
    </Suspense>
  );
}
