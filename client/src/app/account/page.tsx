import type { Metadata } from 'next';
import { AccountPage } from '@/features/auth';

export const metadata: Metadata = { title: 'আমার অ্যাকাউন্ট', robots: { index: false } };

export default function AccountRoute() {
  return <AccountPage />;
}
