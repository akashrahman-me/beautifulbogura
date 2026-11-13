import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardGridSkeleton } from '@/components/shared/Skeleton';
import { DoctorList } from '@/features/doctor';

export const metadata: Metadata = { title: 'ডাক্তারদের তালিকা', description: 'বগুড়ার ডাক্তার, বিশেষজ্ঞতা, চেম্বারের সময় ও সিরিয়াল নম্বর।' };

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="container-page pt-24"><CardGridSkeleton count={6} height={240} keyPrefix="doctor-route" /></div>}>
      <DoctorList />
    </Suspense>
  );
}
