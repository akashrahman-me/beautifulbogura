import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetDb, staff } from '../../../tests/helpers';

beforeEach(resetDb);

describe('directory', () => {
  it('lists one type, hides hidden entries, averages ratings on ratable lists only', async () => {
    const ed = await staff('editor');
    const r = await api().post('/api/v1/admin/directory').set(ed.auth).send({ type: 'restaurant', name: 'দই ঘর', phone: '01712345640' });
    await api().post('/api/v1/admin/directory').set(ed.auth).send({ type: 'restaurant', name: 'বন্ধ দোকান', hidden: true });
    const p = await api().post('/api/v1/admin/directory').set(ed.auth).send({ type: 'police', name: 'ওসি' });
    expect((await api().get('/api/v1/directory/restaurant')).body.meta.total).toBe(1);
    expect((await api().get('/api/v1/directory/unknown-type')).status).toBe(400);
    await api().post(`/api/v1/directory/restaurant/${r.body.data.id}/rate`).send({ stars: 5 });
    const second = await api().post(`/api/v1/directory/restaurant/${r.body.data.id}/rate`).send({ stars: 4 });
    expect(second.body.data).toMatchObject({ rating: 4.5, ratingCount: 2 });
    expect((await api().post(`/api/v1/directory/police/${p.body.data.id}/rate`).send({ stars: 5 })).body.code).toBe('NOT_RATABLE');
    expect((await api().post(`/api/v1/directory/restaurant/${r.body.data.id}/rate`).send({ stars: 6 })).status).toBe(400);
  });
});
