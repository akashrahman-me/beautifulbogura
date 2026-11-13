import type { IconName } from '@/components/ui/Icon';

export interface Weather {
  place: string;
  temp: number;
  condition: string;
  icon: IconName;
  rain: number;
  humidity: number;
  wind: number;
  updatedAt: string;
  forecast: { day: string; icon: IconName; hi: number; lo: number }[];
}
