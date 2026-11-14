import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetDb, staff } from '../../../tests/helpers';
import { dhakaWeekday } from '@/utils/time';

beforeEach(resetDb);

describe('admin content (doctors)', () => {
  it('create → public, edit with audit diff, hide, soft delete with undo', async () => {
    const ed = await staff('editor');
    const body = { name: 'ডা. তানভীর আহমেদ', specialty: 'হৃদরোগ', degrees: ['MBBS', 'MD'], phone: '01712345620', about: '', photo: null, chambers: [{ hospital: 'নিরাময় হাসপাতাল', days: [dhakaWeekday()], time: 'সন্ধ্যা ৬টা', serial: '', fee: 800 }], verified: true, hidden: false };
    const c = await api().post('/api/v1/admin/doctors').set(ed.auth).send(body);
    expect(c.status).toBe(201);
    const id = c.body.data.id;
    const pub = await api().get('/api/v1/doctors?today=true');
    expect(pub.body.data[0]).toMatchObject({ id, sittingToday: true });
    expect(pub.body.data[0]).not.toHaveProperty('hidden');
    expect((await api().get('/api/v1/doctors/stats')).body.data).toMatchObject({ total: 1, sittingToday: 1, specialties: [{ name: 'হৃদরোগ', count: 1 }] });

    await api().patch(`/api/v1/admin/doctors/${id}`).set(ed.auth).send({ phone: '01712345621' });
    const admin = await staff('admin');
    const log = await api().get('/api/v1/admin/audit?action=content.update').set(admin.auth);
    expect(log.body.data[0]).toMatchObject({ resource: { type: 'content', label: body.name }, changes: { phone: ['01712345620', '01712345621'] } });

    await api().patch(`/api/v1/admin/doctors/${id}`).set(ed.auth).send({ hidden: true });
    expect((await api().get(`/api/v1/doctors/${id}`)).status).toBe(404);

    expect((await api().delete(`/api/v1/admin/doctors/${id}`).set(ed.auth).send({ reason: 'পরীক্ষা' })).status).toBe(204);
    expect((await api().get(`/api/v1/admin/doctors/${id}`).set(ed.auth)).status).toBe(404);
    expect((await api().post(`/api/v1/admin/doctors/${id}/restore`).set(ed.auth)).status).toBe(200);
    expect((await api().get('/api/v1/admin/doctors').set(ed.auth)).body.meta.total).toBe(1);
  });

  it('rejects a doctor without chambers and photos that are not ours', async () => {
    const ed = await staff('editor');
    const r = await api().post('/api/v1/admin/doctors').set(ed.auth).send({ name: 'ডা. পরীক্ষা', specialty: 'মেডিসিন', chambers: [], photo: 'https://evil.example/x.jpg' });
    expect(r.status).toBe(400);
    expect(r.body.errors.map((e: { path: string }) => e.path).sort()).toEqual(['chambers', 'photo']);
  });
});
