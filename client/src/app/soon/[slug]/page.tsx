import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/States';
import { SERVICES, serviceBySlug } from '@/config/services';

export const metadata: Metadata = { title: 'শীঘ্রই আসছে' };

export function generateStaticParams() {
  return SERVICES.filter((s) => s.soon).map((s) => ({ slug: s.slug }));
}

export default async function SoonPage({ params }: PageProps<'/soon/[slug]'>) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s?.soon) notFound();
  return (
    <div className="container-narrow pt-10">
      <EmptyState icon={s.icon} title={`${s.label} — শীঘ্রই আসছে`} action={<Button href="/services" variant="secondary">অন্য সেবা দেখুন</Button>}>
        এই সেবাটি তৈরি হচ্ছে। ততক্ষণ অন্য সেবাগুলো ব্যবহার করুন।
      </EmptyState>
    </div>
  );
}
