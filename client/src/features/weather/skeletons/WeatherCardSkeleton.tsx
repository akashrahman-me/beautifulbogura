'use client';

import { Skeleton } from '@/components/shared/Skeleton';

export function WeatherCardSkeleton() {
  return (
    <div className="bb-weather" aria-busy="true">
      <Skeleton uniqueKey="weather-card" viewBox="0 0 360 250" height={250}>
        <rect x="0" y="0" rx="16" width="64" height="64" />
        <rect x="80" y="6" rx="6" width="96" height="36" />
        <rect x="80" y="50" rx="4" width="150" height="12" />
        <rect x="0" y="84" rx="12" width="112" height="56" />
        <rect x="124" y="84" rx="12" width="112" height="56" />
        <rect x="248" y="84" rx="12" width="112" height="56" />
        <rect x="30" y="166" rx="4" width="60" height="12" />
        <rect x="150" y="166" rx="4" width="60" height="12" />
        <rect x="270" y="166" rx="4" width="60" height="12" />
        <rect x="30" y="190" rx="4" width="60" height="22" />
        <rect x="150" y="190" rx="4" width="60" height="22" />
        <rect x="270" y="190" rx="4" width="60" height="22" />
        <rect x="0" y="230" rx="4" width="120" height="10" />
      </Skeleton>
    </div>
  );
}
