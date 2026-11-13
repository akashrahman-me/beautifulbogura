import type { Metadata } from 'next';
import { WorkerRegisterForm } from '@/features/worker';

export const metadata: Metadata = { title: 'কারিগর হিসেবে নিবন্ধন' };

export default function Page() {
  return <WorkerRegisterForm />;
}
