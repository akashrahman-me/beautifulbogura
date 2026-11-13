import type { Metadata } from 'next';
import { AuditPage } from '@/features/audit';

export const metadata: Metadata = { title: 'অডিট লগ' };

export default function Page() {
  return <AuditPage />;
}
