import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { BloodBank } from '@/features/donor';

export const metadata: Metadata = { title: 'রক্ত ব্যাংক', description: 'বগুড়ার রক্তদাতাদের তালিকা — গ্রুপ, এলাকা ও রক্ত দিতে প্রস্তুত কিনা।' };

export default function BloodBankPage() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} height={210} keyPrefix="donor-route" /></div>}>
      <BloodBank />
    </Suspense>
  );
}
