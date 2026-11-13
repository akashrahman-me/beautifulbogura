import type { Metadata } from 'next';
import { VehicleForm } from '@/features/vehicle';

export const metadata: Metadata = { title: 'গাড়ির তথ্য দিন' };

export default function Page() {
  return <VehicleForm />;
}
