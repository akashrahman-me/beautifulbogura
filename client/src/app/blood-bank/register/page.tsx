import type { Metadata } from 'next';
import { RegisterDonorForm } from '@/features/donor';

export const metadata: Metadata = { title: 'রক্তদাতা হোন' };

export default function RegisterDonorPage() {
  return <RegisterDonorForm />;
}
