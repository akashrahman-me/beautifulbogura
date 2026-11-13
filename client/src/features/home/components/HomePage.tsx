'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SOCIAL } from '@/config/services';
import { Chip } from '@/components/ui/Chip';
import { SearchField } from '@/components/ui/Interactive';
import { SectionHeader } from '@/components/shared/Blocks';
import { WeatherCard } from '@/features/weather';
import { DateBar, EmergencyCard, HeroSlider, QuickLinks } from './HomeWidgets';
import { NotificationPrompt } from './NotificationPrompt';
import { RecentPopular } from './RecentPopular';
import { ServiceGrid } from './ServiceGrid';

/** Home, in the order the design system sets for phones; two columns from lg. */
export function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <div className="container-page flex flex-col gap-8 pt-5 pb-8 md:gap-12 lg:pt-8">
      <div className="flex flex-col gap-4">
        <DateBar />
        <SearchField size="lg" value={q} onChange={setQ} onSubmit={(v) => v.trim() && router.push(`/search?q=${encodeURIComponent(v.trim())}`)} />
        <QuickLinks />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <HeroSlider />
        <div className="flex flex-col gap-4">
          <EmergencyCard />
          <WeatherCard />
        </div>
      </div>

      <NotificationPrompt />

      <section className="flex flex-col gap-4">
        <SectionHeader title="আপনার জন্য" />
        <RecentPopular />
      </section>

      <section className="flex flex-col gap-4" id="services">
        <SectionHeader title="সব সেবা" action={{ label: 'আলাদা পাতায় দেখুন', href: '/services' }} />
        <ServiceGrid />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-h2">আমাদের সাথে থাকুন</h2>
        <p className="text-body-sm text-ink-muted">নতুন সেবা, জরুরি ঘোষণা আর রক্তের অনুরোধ সবার আগে পেতে অনুসরণ করুন।</p>
        <div className="flex flex-wrap gap-2">
          {SOCIAL.map((s) => (
            <Chip key={s.label} href={s.href}>
              {s.label}
            </Chip>
          ))}
        </div>
      </section>
    </div>
  );
}
