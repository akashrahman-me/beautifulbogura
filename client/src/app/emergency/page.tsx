import type { Metadata } from 'next';
import { EmergencyHub } from '@/features/directory';

export const metadata: Metadata = { title: 'জরুরি সেবা' };

export default function EmergencyPage() {
  return <EmergencyHub />;
}
