import { beforeEach, describe, expect, it } from 'vitest';
import { api, resetDb, staff } from '../../../tests/helpers';

beforeEach(resetDb);

const csv = ['voterNo,name,fatherName,motherName,dob,gender,union,village,centre', '1001,রহিম উদ্দিন,করিম,আমেনা,1980-05-01,male,নুনগোলা,উত্তরপাড়া,নুনগোলা স্কুল', '1002,"রাশিদা, বেগম",আব্দুল,হালিমা,1985-02-11,female,শাখারিয়া,দক্ষিণপাড়া,শাখারিয়া স্কুল', ',নাম নেই,,,1990-01-01,male,নুনগোলা,,', '1003,ভুল তারিখ,,,01/02/1990,male,নুনগোলা,,'].join('\n');

describe('voter roll', () => {
  it('imports CSV (quoted fields, bad rows reported) and re-import updates', async () => {
    const admin = await staff('admin');
    const r = await api().post('/api/v1/admin/voters/import').set(admin.auth).attach('file', Buffer.from(csv), 'roll.csv');
    expect(r.status).toBe(201);
    expect(r.body.data).toMatchObject({ imported: 2, updated: 0, skipped: 2 });
    expect(r.body.data.errors.map((e: { row: number }) => e.row)).toEqual([4, 5]);
    const again = await api().post('/api/v1/admin/voters/import').set(admin.auth).attach('file', Buffer.from(csv), 'roll.csv');
    expect(again.body.data).toMatchObject({ imported: 0, updated: 2 });
    expect((await api().get('/api/v1/admin/voters/stats').set(admin.auth)).body.data.total).toBe(2);
    expect((await api().post('/api/v1/admin/voters/import').set(admin.auth).attach('file', Buffer.from('a,b\n1,2'), 'x.csv')).body.code).toBe('BAD_CSV');
  });

  it('public lookup needs a narrowing filter; staff searches are audited', async () => {
    const admin = await staff('admin');
    await api().post('/api/v1/admin/voters/import').set(admin.auth).attach('file', Buffer.from(csv), 'roll.csv');
    expect((await api().get('/api/v1/voters')).status).toBe(400);
    expect((await api().get('/api/v1/voters?birthYear=1985')).body.data[0].name).toBe('রাশিদা, বেগম');
    expect((await api().get('/api/v1/voters?search=রহিম')).body.meta.total).toBe(1);
    await api().get('/api/v1/admin/voters?search=রহিম').set(admin.auth);
    const log = await api().get('/api/v1/admin/audit?action=voters.search').set(admin.auth);
    expect(log.body.data[0].resource.label).toContain('রহিম');
  });
});
