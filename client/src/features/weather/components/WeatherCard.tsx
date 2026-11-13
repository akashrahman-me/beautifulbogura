'use client';

import { bn, timeAgo } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { ErrorState } from '@/components/shared/States';
import { useWeather } from '../hooks/useWeather';
import { WeatherCardSkeleton } from '../skeletons/WeatherCardSkeleton';

export function WeatherCard() {
  const { data, isPending, isError, error, refetch } = useWeather();
  if (isPending) return <WeatherCardSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <section className="bb-weather" aria-label="আবহাওয়া">
      <div className="bb-weather-now">
        <span className="bb-weather-icon">
          <Icon name={data.icon} size={40} strokeWidth={1.5} />
        </span>
        <div>
          <p className="bb-weather-temp">
            {bn(data.temp)}
            <span>°সে</span>
          </p>
          <p className="bb-weather-cond">
            {data.condition} · {data.place}
          </p>
        </div>
      </div>
      <dl className="bb-weather-stats">
        {(
          [
            ['umbrella', 'বৃষ্টি', `${bn(data.rain)}%`],
            ['humidity', 'আর্দ্রতা', `${bn(data.humidity)}%`],
            ['wind', 'বাতাস', `${bn(data.wind)} কিমি/ঘ`],
          ] as const
        ).map(([icon, label, value]) => (
          <div key={label} className="bb-weather-stat">
            <Icon name={icon} size={18} />
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <ol className="bb-weather-forecast" aria-label="আগামী ৩ দিন">
        {data.forecast.map((f) => (
          <li key={f.day}>
            <span className="bb-weather-day">{f.day}</span>
            <Icon name={f.icon} size={22} />
            <span className="bb-weather-range">
              {bn(f.hi)}°<span> / {bn(f.lo)}°</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-caption text-ink-subtle">হালনাগাদ: {timeAgo(data.updatedAt)}</p>
    </section>
  );
}
