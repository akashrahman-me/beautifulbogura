import type { Metadata } from 'next';
import { AddInstitutionForm } from '@/features/institution';

export const metadata: Metadata = { title: 'প্রতিষ্ঠান যুক্ত করুন' };

export default function Page() {
  return <AddInstitutionForm />;
}
