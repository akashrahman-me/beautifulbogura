import { beforeEach, describe, expect, it } from 'vitest';
import { api, member, resetDb, staff, tomorrow } from './helpers';
import { clearWeatherCache, getWeather } from '@/modules/weather/weather.service';

beforeEach(resetDb);

describe('app', () => {
  it('health, unknown routes, error envelope, request id', async () => {
    expect((await api().get('/health')).body).toEqual({ status: 'ok' });
    const nf = await api().get('/api/v1/nope');
    expect(nf.status).toBe(404);
    expect(nf.body).toMatchObject({ success: false, code: 'ROUTE_NOT_FOUND' });
    expect(nf.body).not.toHaveProperty('stack');
    expect(nf.headers['x-request-id']).toBeTruthy();
    const bad = await api().post('/api/v1/donors').set('Content-Type', 'application/json').send('{bad');
    expect(bad.body.code).toBe('BAD_JSON');
  });

  it('CORS allows both front ends with credentials and no one else', async () => {
    const ok = await api().options('/api/v1/doctors').set('Origin', 'http://localhost:3001').set('Access-Control-Request-Method', 'GET');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    expect(ok.headers['access-control-allow-credentials']).toBe('true');
    const no = await api().options('/api/v1/doctors').set('Origin', 'https://evil.example').set('Access-Control-Request-Method', 'GET');
    expect(no.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects query operator injection', async () => {
    expect((await api().get('/api/v1/voters?search[$ne]=x')).status).toBe(400);
  });

  it('OpenAPI lists public and admin routes with permissions', async () => {
    const spec = (await api().get('/api/docs.json')).body;
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.paths['/api/v1/jobs'].post.security).toBeTruthy();
    expect(spec.paths['/api/v1/admin/reports/{id}/resolve'].post['x-permission']).toBe('reports.manage');
  });

  it('search and dashboard', async () => {
    const m = await member();
    await api().post('/api/v1/jobs').set(m.auth).send({ company: 'করতোয়া নেট', title: 'নেটওয়ার্ক টেকনিশিয়ান', vacancies: 1, salary: 'আলোচনা', deadline: tomorrow(), details: 'রাউটার আর ফাইবারের কাজ জানতে হবে।', phone: '01712345660', whatsapp: false, address: 'শেরপুর রোড', durationDays: 7, images: [] });
    const s = await api().get('/api/v1/search?q=নেটওয়ার্ক');
    expect(s.body.data[0]).toMatchObject({ kind: 'job', title: 'নেটওয়ার্ক টেকনিশিয়ান' });
    const admin = await staff('admin');
    const d = await api().get('/api/v1/admin/dashboard').set(admin.auth);
    expect(d.body.data.kpis).toMatchObject({ postsToday: 1, activePosts: 1 });
    expect(d.body.data.activity).toHaveLength(30);
    expect(d.body.data.activity.at(-1).posts).toBe(1);
    expect(d.body.data.postsByKind.find((k: { kind: string }) => k.kind === 'job').count).toBe(1);
    const hits = await api().get('/api/v1/admin/search?q=নেটওয়ার্ক').set(admin.auth);
    expect(hits.body.data[0]).toMatchObject({ kind: 'post', href: expect.stringContaining('/posts?open=') });
    expect((await api().get('/api/v1/admin/search?q=নেটওয়ার্ক').set((await staff('editor')).auth)).body.data).toHaveLength(0);
  });

  it('popular services fall back to the default list and follow views', async () => {
    expect((await api().get('/api/v1/services/popular')).body.data[0]).toBe('blood-bank');
    for (let i = 0; i < 3; i++) await api().post('/api/v1/services/weather/views');
    expect((await api().get('/api/v1/services/popular')).body.data[0]).toBe('weather');
  });

  it('maps Open-Meteo to the site’s weather shape', async () => {
    clearWeatherCache();
    const fake = (async () =>
      new Response(
        JSON.stringify({
          current: { temperature_2m: 24.4, relative_humidity_2m: 68, wind_speed_10m: 8.2, weather_code: 2, time: '' },
          daily: { time: ['2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17'], weather_code: [2, 0, 61, 95], temperature_2m_max: [27, 26.6, 23, 22], temperature_2m_min: [16, 17, 18, 19], precipitation_probability_max: [10, 0, 80, 90] },
        }),
      )) as unknown as typeof fetch;
    const w = (await getWeather(fake)) as { temp: number; icon: string; condition: string; forecast: { day: string; icon: string; hi: number }[] };
    expect(w).toMatchObject({ temp: 24, icon: 'cloud-sun', condition: 'আংশিক মেঘলা', rain: 10, humidity: 68, wind: 8 });
    expect(w.forecast.map((f) => f.icon)).toEqual(['sun', 'rain', 'bolt']);
    expect(w.forecast[0]).toMatchObject({ day: 'রবি', hi: 27 });
  });
});
