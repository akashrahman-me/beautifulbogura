import { beforeEach, describe, expect, it } from 'vitest';
import { api, member, resetDb, staff } from '../../../tests/helpers';

beforeEach(resetDb);

describe('permissions', () => {
  it('401 without a token, 403 for a public account, per-role access for staff', async () => {
    expect((await api().get('/api/v1/admin/counts')).status).toBe(401);
    const m = await member();
    expect((await api().get('/api/v1/admin/counts').set(m.auth)).status).toBe(403);
    const ed = await staff('editor');
    const mod = await staff('moderator');
    expect((await api().get('/api/v1/admin/reports').set(ed.auth)).status).toBe(403);
    expect((await api().get('/api/v1/admin/doctors').set(mod.auth)).status).toBe(403);
    expect((await api().get('/api/v1/admin/voters/stats').set(mod.auth)).status).toBe(403);
    expect((await api().get('/api/v1/admin/staff').set(ed.auth)).status).toBe(403);
    expect((await api().get('/api/v1/admin/doctors').set(ed.auth)).status).toBe(200);
    expect((await api().get('/api/v1/admin/reports').set(mod.auth)).status).toBe(200);
  });
});

describe('public accounts', () => {
  it('lists with counts, bans with a reason, unbans; staff cannot be banned', async () => {
    const m = await member('someone@example.com');
    const mod = await staff('moderator');
    const list = await api().get('/api/v1/admin/users?search=someone').set(mod.auth);
    expect(list.body.data[0]).toMatchObject({ email: 'someone@example.com', posts: 0, status: 'active' });
    expect((await api().post(`/api/v1/admin/users/${m.user!.id}/ban`).set(mod.auth).send({ reason: 'স্প্যাম' })).body.data.status).toBe('banned');
    expect((await api().get('/api/v1/admin/users?status=banned').set(mod.auth)).body.meta.total).toBe(1);
    expect((await api().post(`/api/v1/admin/users/${m.user!.id}/unban`).set(mod.auth)).body.data.status).toBe('active');
    expect((await api().post(`/api/v1/admin/users/${mod.user!.id}/ban`).set(mod.auth).send({ reason: 'পরীক্ষা' })).body.code).toBe('IS_STAFF');
  });
});
