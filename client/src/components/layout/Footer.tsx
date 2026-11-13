import Link from 'next/link';
import { SOCIAL } from '@/config/services';
import { Wordmark } from '@/components/ui/Misc';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface pb-28 lg:pb-12">
      <div className="container-page flex flex-col gap-8 pt-10 md:flex-row md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Wordmark tagline="বগুড়ার সব সেবা, এক জায়গায়" />
          <p className="text-body-sm text-ink-muted">
            তথ্য যুক্ত, সংশোধন বা মুছে ফেলতে অ্যাডমিনের সাথে যোগাযোগ করুন। জরুরি প্রয়োজনে সবসময় আগে ৯৯৯ নম্বরে কল করুন।
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-body-sm" aria-label="ফুটার">
          <Link href="/services" className="hover:text-brand">সব সেবা</Link>
          <Link href="/emergency" className="hover:text-brand">জরুরি সেবা</Link>
          <Link href="/blood-bank/register" className="hover:text-brand">রক্তদাতা হোন</Link>
          <Link href="/doctors/new" className="hover:text-brand">ডাক্তার যুক্ত করুন</Link>
          <Link href="/area" className="hover:text-brand">উপজেলা পরিচিতি</Link>
          <Link href="/education" className="hover:text-brand">শিক্ষা প্রতিষ্ঠান</Link>
        </nav>
        <div className="flex flex-col gap-2 text-body-sm">
          <p className="text-label">আমাদের অনুসরণ করুন</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-brand">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
