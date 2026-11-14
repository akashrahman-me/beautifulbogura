import { beforeEach, describe, expect, it } from 'vitest';
import { api, member, resetDb, tomorrow } from '../../../tests/helpers';
import { UserModel } from '@/modules/user/user.model';
import * as siteService from '@/modules/site/site.service';
import { DEFAULTS } from '@/modules/site/site.defaults';

beforeEach(resetDb);

const job = (over: Record<string, unknown> = {}) => ({
  company: 'দই ঘর', title: 'ক্যাশিয়ার', vacancies: 2, salary: '৳ ১৩,০০০', deadline: tomorrow(), education: 'এইচএসসি',
  details: 'কম্পিউটার চালাতে জানতে হবে, সন্ধ্যার শিফট।', phone: '01712345678', whatsapp: true, address: 'সাতমাথা', durationDays: 15, images: [], ...over,
});
const listing = { category: 'mobile', title: 'Samsung A54', condition: 'used', price: 28500, description: 'আট মাস ব্যবহার, বক্স আছে।', sellerName: 'রাকিব', phone: '01712345679', whatsapp: false, address: 'মালতীনগর', images: [] };

describe('community posts', () => {
  it('requires sign-in to post', async () => {
    const r = await api().post('/api/v1/jobs').send(job());
    expect(r.status).toBe(401);
    expect(r.body.code).toBe('UNAUTHENTICATED');
  });

  it('creates, lists and shows a post in the site’s shape', async () => {
    const m = await member();
    const c = await api().post('/api/v1/jobs').set(m.auth).send(job());
    expect(c.status).toBe(201);
    expect(c.body.data).toMatchObject({ status: 'published' });
    const list = await api().get('/api/v1/jobs?search=ক্যাশিয়ার');
    expect(list.body.meta).toMatchObject({ page: 1, total: 1 });
    const p = list.body.data[0];
    expect(p).toMatchObject({ title: 'ক্যাশিয়ার', company: 'দই ঘর', status: 'active', image: null, ownerId: m.user!.id });
    expect(p.featured).toBe(false);
    expect(p).not.toHaveProperty('reports');
    expect((await api().get(`/api/v1/jobs/${p.id}`)).body.data.id).toBe(p.id);
  });

  it('validates with field paths, never accepts featured, rejects the honeypot', async () => {
    const m = await member();
    const bad = await api().post('/api/v1/jobs').set(m.auth).send(job({ phone: '123', durationDays: 9 }));
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe('VALIDATION_ERROR');
    expect(bad.body.errors.map((e: { path: string }) => e.path)).toContain('phone');
    const dur = await api().post('/api/v1/jobs').set(m.auth).send(job({ durationDays: 9 }));
    expect(dur.body.errors[0].path).toBe('durationDays');
    expect((await api().post('/api/v1/jobs').set(m.auth).send(job({ website: 'spam' }))).status).toBe(400);
    const sneaky = await api().post('/api/v1/rentals').set(m.auth).send({ ownerName: 'মালিক', phone: '01712345670', whatsapp: true, type: 'flat', rent: 9000, rooms: 2, gas: true, attachedBath: true, title: '২ রুমের ফ্ল্যাট', address: 'কলোনি', featured: true, images: [] });
    expect(sneaky.status).toBe(201);
    expect((await api().get('/api/v1/rentals')).body.data[0].featured).toBe(false);
  });

  it('only the owner may edit or manage; done listings stay visible as sold', async () => {
    const owner = await member();
    const other = await member();
    const { id } = (await api().post('/api/v1/listings').set(owner.auth).send(listing)).body.data;
    const nope = await api().post(`/api/v1/listings/${id}/manage`).set(other.auth).send({ action: 'delete' });
    expect(nope.status).toBe(403);
    expect(nope.body.code).toBe('NOT_OWNER');
    expect((await api().patch(`/api/v1/listings/${id}`).set(owner.auth).send({ price: 27000 })).body.data.price).toBe(27000);
    expect((await api().post(`/api/v1/listings/${id}/manage`).set(owner.auth).send({ action: 'mark-done' })).status).toBe(200);
    expect((await api().get('/api/v1/listings')).body.data[0].status).toBe('sold');
    const mine = await api().get('/api/v1/me/posts').set(owner.auth);
    expect(mine.body.data[0]).toMatchObject({ kind: 'listing', id, status: 'sold', href: '/buy-sell' });
    await api().post(`/api/v1/listings/${id}/manage`).set(owner.auth).send({ action: 'delete' });
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(0);
  });

  it('blocks banned accounts, enforces the daily limit and maintenance mode', async () => {
    const m = await member();
    await siteService.seedDoc('site.settings', { ...DEFAULTS['site.settings'], posting: { ...DEFAULTS['site.settings'].posting, postsPerDay: 1 } });
    expect((await api().post('/api/v1/jobs').set(m.auth).send(job())).status).toBe(201);
    const limit = await api().post('/api/v1/jobs').set(m.auth).send(job());
    expect(limit.status).toBe(429);
    expect(limit.body.code).toBe('POST_LIMIT');

    const b = await member();
    await UserModel.updateOne({ _id: b.user!.id }, { status: 'banned' });
    expect((await api().post('/api/v1/jobs').set(b.auth).send(job())).body.code).toBe('BANNED');

    await siteService.seedDoc('site.settings', { ...DEFAULTS['site.settings'], maintenance: { enabled: true, message: 'আজ রাতে কাজ চলছে' } });
    const c = await member();
    const mt = await api().post('/api/v1/jobs').set(c.auth).send(job());
    expect(mt.status).toBe(503);
    expect(mt.body.message).toBe('আজ রাতে কাজ চলছে');
  });

  it('applies the legal marriage age per gender', async () => {
    const m = await member();
    const year = new Date().getFullYear();
    const body = { gender: 'groom', name: 'পাত্র', birthYear: year - 19, religion: 'islam', maritalStatus: 'unmarried', education: 'স্নাতক', profession: 'শিক্ষক', familyMembers: 'বাবা, মা', preference: 'শিক্ষিত ও ধার্মিক', address: 'বগুড়া', phone: '01712345671', whatsapp: true, photo: null };
    const young = await api().post('/api/v1/matrimony').set(m.auth).send(body);
    expect(young.status).toBe(400);
    expect(young.body.errors[0].path).toBe('birthYear');
    expect((await api().post('/api/v1/matrimony').set(m.auth).send({ ...body, gender: 'bride' })).status).toBe(201);
    expect((await api().get('/api/v1/matrimony?gender=bride')).body.data[0].photo).toBeNull();
  });

  it('needs a qualification from someone offering to teach', async () => {
    const m = await member();
    const t = { kind: 'want-to-teach', name: 'শিক্ষক', phone: '01712345672', classLevel: 'নবম', subject: 'গণিত', address: 'বনানী', images: [] };
    expect((await api().post('/api/v1/tuitions').set(m.auth).send(t)).body.errors[0].path).toBe('qualification');
    expect((await api().post('/api/v1/tuitions').set(m.auth).send({ ...t, qualification: 'বিএসসি' })).status).toBe(201);
  });
});

describe('reports', () => {
  it('counts one report per person and hides the post at the threshold', async () => {
    await siteService.seedDoc('site.settings', { ...DEFAULTS['site.settings'], moderation: { autoHideAfterReports: 2, reviewSlaHours: 24 } });
    const owner = await member();
    const { id } = (await api().post('/api/v1/listings').set(owner.auth).send(listing)).body.data;
    const r1 = await member();
    const r2 = await member();
    await api().post(`/api/v1/listings/${id}/report`).set(r1.auth).send({ reason: 'fake', note: 'অগ্রিম টাকা চাইছে' });
    // The same person again does not count twice.
    await api().post(`/api/v1/listings/${id}/report`).set(r1.auth).send({ reason: 'fake' });
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(1);
    await api().post(`/api/v1/listings/${id}/report`).set(r2.auth).send({ reason: 'wrong-info' });
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(0);
    expect((await api().get(`/api/v1/listings/${id}`)).status).toBe(404);
  });

  it('rejects unknown reasons and missing posts', async () => {
    const m = await member();
    const { id } = (await api().post('/api/v1/listings').set(m.auth).send(listing)).body.data;
    expect((await api().post(`/api/v1/listings/${id}/report`).send({ reason: 'boring' })).status).toBe(400);
    expect((await api().post('/api/v1/listings/0123456789abcdef01234567/report').send({ reason: 'fake' })).status).toBe(404);
    expect((await api().get('/api/v1/listings/not-an-id')).body.code).toBe('VALIDATION_ERROR');
  });
});
