import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetDb } from '../../../tests/helpers';

beforeEach(resetDb);

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

describe('blood bank', () => {
  it('registers once per number, lists ready donors first, counts by status', async () => {
    await api().post('/api/v1/donors').send({ name: 'সাম্প্রতিক দাতা', group: 'O+', phone: '01712345630', address: 'কলোনি', lastDonation: daysAgo(10) });
    await api().post('/api/v1/donors').send({ name: 'প্রস্তুত দাতা', group: 'O+', phone: '01712345631', address: 'বনানী', lastDonation: daysAgo(200) });
    const dup = await api().post('/api/v1/donors').send({ name: 'আবার', group: 'A+', phone: '01712345631', address: 'বনানী', lastDonation: null });
    expect(dup.status).toBe(409);
    expect(dup.body).toMatchObject({ code: 'DONOR_EXISTS', errors: [{ path: 'phone' }] });
    const list = await api().get('/api/v1/donors?group=O%2B');
    expect(list.body.data.map((d: { name: string }) => d.name)).toEqual(['প্রস্তুত দাতা', 'সাম্প্রতিক দাতা']);
    expect((await api().get('/api/v1/donors?status=ready')).body.meta.total).toBe(1);
    expect((await api().get('/api/v1/donors/stats')).body.data).toMatchObject({ total: 2, ready: 1, notYet: 1, unknown: 0, byGroup: { 'O+': 2 } });
  });

  it('updates the last donation only with the registered number', async () => {
    const d = (await api().post('/api/v1/donors').send({ name: 'দাতা', group: 'B+', phone: '01712345632', address: 'কলোনি', lastDonation: null })).body.data;
    const wrong = await api().patch(`/api/v1/donors/${d.id}/last-donation`).send({ phone: '01712345633', lastDonation: daysAgo(1) });
    expect(wrong.status).toBe(403);
    expect(wrong.body.code).toBe('PHONE_MISMATCH');
    expect((await api().patch(`/api/v1/donors/${d.id}/last-donation`).send({ phone: '০১৭১২৩৪৫৬৩২', lastDonation: daysAgo(1) })).status).toBe(200);
  });
});
