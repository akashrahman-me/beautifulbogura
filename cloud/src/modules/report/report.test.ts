import { beforeEach, describe, expect, it } from 'vitest';
import { api, member, resetDb, SITE, staff } from '../../../tests/helpers';
import * as siteService from '@/modules/site/site.service';
import { DEFAULTS } from '@/modules/site/site.defaults';

beforeEach(resetDb);

const listing = { category: 'mobile', title: 'iPhone 13', condition: 'used', price: 50000, description: 'অগ্রিম টাকা দিলে পাঠাব।', sellerName: 'সন্দেহজনক', phone: '01712345610', whatsapp: false, address: 'কলোনি', images: [] };

describe('report decisions', () => {
  it('dismiss keeps the post and un-hides it', async () => {
    await siteService.seedDoc('site.settings', { ...DEFAULTS['site.settings'], moderation: { autoHideAfterReports: 1, reviewSlaHours: 24 } });
    const owner = await member();
    const { id } = (await api().post('/api/v1/listings').set(owner.auth).send(listing)).body.data;
    await api().post(`/api/v1/listings/${id}/report`).send({ reason: 'fake' });
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(0);
    const mod = await staff('moderator');
    const cases = await api().get('/api/v1/admin/reports?status=open').set(mod.auth);
    expect(cases.body.data[0]).toMatchObject({ count: 1, autoHidden: true, reasons: { fake: 1 }, post: { id, kind: 'listing' } });
    expect((await api().post(`/api/v1/admin/reports/${cases.body.data[0].id}/dismiss`).set(mod.auth).send({})).body.data.status).toBe('dismissed');
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(1);
  });

  it('resolve with ban removes the post, bans the owner, hides their other posts and signs them out', async () => {
    const owner = await member();
    const a = (await api().post('/api/v1/listings').set(owner.auth).send(listing)).body.data.id;
    await api().post('/api/v1/listings').set(owner.auth).send({ ...listing, title: 'অন্য পোস্ট' });
    await api().post(`/api/v1/listings/${a}/report`).send({ reason: 'fake' });
    const mod = await staff('moderator');
    const caseId = (await api().get('/api/v1/admin/reports').set(mod.auth)).body.data[0].id;
    const r = await api().post(`/api/v1/admin/reports/${caseId}/resolve`).set(mod.auth).send({ reason: 'ভুয়া বা প্রতারণা', ban: true });
    expect(r.status).toBe(200);
    expect(r.body.data.status).toBe('resolved');
    expect((await api().get('/api/v1/listings')).body.meta.total).toBe(0);
    const u = await api().get(`/api/v1/admin/users/${owner.user!.id}`).set(mod.auth);
    expect(u.body.data).toMatchObject({ status: 'banned', removedPosts: 2, ban: { reason: 'ভুয়া বা প্রতারণা' } });
    expect((await api().post('/api/v1/auth/refresh').set('Origin', SITE).set('Cookie', owner.cookie!)).status).toBe(401);
    expect((await api().post(`/api/v1/admin/reports/${caseId}/dismiss`).set(mod.auth).send({})).body.code).toBe('ALREADY_DECIDED');
  });
});
