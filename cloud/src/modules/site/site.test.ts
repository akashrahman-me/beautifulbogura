import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetDb, staff } from '../../../tests/helpers';
import { DEFAULTS } from './site.defaults';

beforeEach(resetDb);

describe('settings, notice, area, slides, push', () => {
  it('settings round-trip and public subset', async () => {
    const admin = await staff('admin');
    const s = { ...DEFAULTS['site.settings'], contact: { adminPhone: '01712345650', email: 'info@example.com' } };
    expect((await api().put('/api/v1/admin/settings').set(admin.auth).send(s)).status).toBe(200);
    const pub = await api().get('/api/v1/site/settings');
    expect(pub.body.data.contact.adminPhone).toBe('01712345650');
    expect(pub.body.data).not.toHaveProperty('moderation');
    expect((await api().put('/api/v1/admin/settings').set((await staff('editor')).auth).send(s)).status).toBe(403);
  });

  it('the notice bar shows only while enabled and unexpired', async () => {
    const ed = await staff('editor');
    expect((await api().get('/api/v1/site/notice')).body.data).toBeNull();
    const n = { enabled: true, severity: 'emergency', title: 'বন্যা সতর্কতা', body: 'করতোয়ার পানি বিপদসীমার উপরে', linkLabel: '', linkHref: '', expiresAt: null };
    await api().put('/api/v1/admin/site-notice').set(ed.auth).send(n);
    expect((await api().get('/api/v1/site/notice')).body.data.title).toBe('বন্যা সতর্কতা');
    await api().put('/api/v1/admin/site-notice').set(ed.auth).send({ ...n, expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect((await api().get('/api/v1/site/notice')).body.data).toBeNull();
    expect((await api().put('/api/v1/admin/site-notice').set(ed.auth).send({ ...n, title: '' })).body.errors[0].path).toBe('title');
  });

  it('area documents and unions', async () => {
    const ed = await staff('editor');
    await api().put('/api/v1/admin/area/profile').set(ed.auth).send({ name: 'বগুড়া সদর', summary: 'বগুড়া সদর উপজেলা উত্তরবঙ্গের প্রাণকেন্দ্র, করতোয়ার তীরে।', stats: [{ label: 'ইউনিয়ন', value: '১১' }], sections: [{ id: '', title: 'ইতিহাস', body: 'মহাস্থানগড় প্রাচীন পুণ্ড্রনগর।' }] });
    expect((await api().get('/api/v1/area/profile')).body.data.stats[0].value).toBe('১১');
    await api().post('/api/v1/admin/area/unions').set(ed.auth).send({ name: 'গোকুল', number: 2 });
    await api().post('/api/v1/admin/area/unions').set(ed.auth).send({ name: 'নুনগোলা', number: 1 });
    expect((await api().get('/api/v1/area/unions')).body.data.map((u: { name: string }) => u.name)).toEqual(['নুনগোলা', 'গোকুল']);
  });

  it('home slides follow their schedule; push is recorded (not delivered without VAPID keys)', async () => {
    const ed = await staff('editor');
    const slide = { order: 1, tone: 'brand', icon: 'grid', eyebrow: 'স্বাগতম', title: 'সব সেবা এক জায়গায়', body: '', cta: { label: 'দেখুন', href: '/services' }, startsAt: null, endsAt: null, active: true };
    await api().post('/api/v1/admin/slides').set(ed.auth).send(slide);
    await api().post('/api/v1/admin/slides').set(ed.auth).send({ ...slide, order: 2, title: 'পরে আসবে স্লাইড', startsAt: new Date(Date.now() + 864e5).toISOString() });
    expect((await api().get('/api/v1/home/slides')).body.data).toHaveLength(1);

    const push = await api().post('/api/v1/admin/push').set(ed.auth).send({ title: 'জরুরি রক্ত', body: 'O- রক্ত প্রয়োজন', url: '/blood-bank', audience: 'donors', bloodGroup: 'O-' });
    expect(push.status).toBe(201);
    expect(push.body.data).toMatchObject({ recipients: 0, delivered: false, sentBy: 'editor স্টাফ' });
    expect((await api().get('/api/v1/admin/push').set(ed.auth)).body.meta.total).toBe(1);
    expect((await api().post('/api/v1/push/subscriptions').send({ subscription: { endpoint: 'http://insecure', keys: { p256dh: 'x'.repeat(20), auth: 'y'.repeat(10) } } })).status).toBe(400);
  });
});
