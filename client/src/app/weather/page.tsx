import type { Metadata } from 'next';
import { PageHeader } from '@/components/shared/Blocks';
import { WeatherCard } from '@/features/weather';

export const metadata: Metadata = { title: 'আবহাওয়া' };

export default function WeatherPage() {
  return (
    <div className="container-narrow flex flex-col gap-4">
      <PageHeader title="আবহাওয়া" />
      <WeatherCard />
    </div>
  );
}
