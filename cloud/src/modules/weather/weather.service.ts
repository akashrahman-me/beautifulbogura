import { env } from '@/config/env';
import { ApiError } from '@/errors/ApiError';

type Icon = 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'bolt';
/** WMO weather codes (Open-Meteo) → Bangla words and the site's icon names. */
const describe = (code: number): { condition: string; icon: Icon } => {
  if (code === 0) return { condition: 'রৌদ্রোজ্জ্বল', icon: 'sun' };
  if (code <= 2) return { condition: 'আংশিক মেঘলা', icon: 'cloud-sun' };
  if (code === 3) return { condition: 'মেঘলা', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'কুয়াশা', icon: 'cloud' };
  if (code >= 95) return { condition: 'বজ্রসহ বৃষ্টি', icon: 'bolt' };
  if (code >= 51) return { condition: code >= 80 ? 'থেমে থেমে বৃষ্টি' : 'বৃষ্টি', icon: 'rain' };
  return { condition: 'মেঘলা', icon: 'cloud' };
};
const WEEKDAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];

let cache: { at: number; data: unknown } | null = null;
const TTL = 15 * 60_000;

interface OpenMeteo {
  current: { temperature_2m: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number; time: string };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
}

/** Current weather + 3-day forecast for Bogura, from Open-Meteo (no key), cached 15 minutes. */
export const getWeather = async (fetcher: typeof fetch = fetch) => {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.search = new URLSearchParams({
    latitude: String(env.WEATHER_LAT),
    longitude: String(env.WEATHER_LON),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Dhaka',
    forecast_days: '4',
  }).toString();
  let w: OpenMeteo;
  try {
    const res = await fetcher(u, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(String(res.status));
    w = (await res.json()) as OpenMeteo;
  } catch {
    if (cache) return cache.data; // stale beats nothing
    throw new ApiError(503, 'আবহাওয়ার তথ্য এখন পাওয়া যাচ্ছে না', 'WEATHER_UNAVAILABLE');
  }
  const now = describe(w.current.weather_code);
  const data = {
    place: 'বগুড়া',
    temp: Math.round(w.current.temperature_2m),
    condition: now.condition,
    icon: now.icon,
    rain: w.daily.precipitation_probability_max[0] ?? 0,
    humidity: Math.round(w.current.relative_humidity_2m),
    wind: Math.round(w.current.wind_speed_10m),
    updatedAt: new Date().toISOString(),
    forecast: [1, 2, 3].map((i) => ({ day: WEEKDAYS[new Date(`${w.daily.time[i]}T12:00:00+06:00`).getUTCDay()], icon: describe(w.daily.weather_code[i]).icon, hi: Math.round(w.daily.temperature_2m_max[i]), lo: Math.round(w.daily.temperature_2m_min[i]) })),
  };
  cache = { at: Date.now(), data };
  return data;
};

export const clearWeatherCache = () => void (cache = null);
