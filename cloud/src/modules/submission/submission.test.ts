import { beforeEach, describe, expect, it } from 'vitest';
import { api, member, resetDb, staff } from '../../../tests/helpers';

beforeEach(resetDb);

const doctor = { name: 'ডা. মাহফুজা খাতুন', specialty: 'শিশু', degrees: ['MBBS', 'DCH'], phone: '01712345600', chambers: [{ hospital: 'সেবা ক্লিনিক', days: [0, 2, 4], time: 'বিকেল ৪টা – রাত ৮টা', serial: '', fee: 600 }] };

describe('review queue', () => {
  it('a public submission waits for review, then publishes with the editor’s edits', async () => {
    const sub = await api().post('/api/v1/doctors').send(doctor);
    expect(sub.status).toBe(201);
    expect(sub.body.data.status).toBe('pending');
    expect((await api().get('/api/v1/doctors')).body.meta.total).toBe(0);

    const ed = await staff('editor');
    const queue = await api().get('/api/v1/admin/submissions?status=pending').set(ed.auth);
    expect(queue.body.data[0]).toMatchObject({ kind: 'doctor', title: doctor.name, priorRejections: 0 });
    const counts = await api().get('/api/v1/admin/counts').set(ed.auth);
    expect(counts.body.data.review).toBe(1);

    const ok = await api().post(`/api/v1/admin/submissions/${sub.body.data.id}/approve`).set(ed.auth).send({ data: { name: 'ডা. মাহফুজা খাতুন (শিশু)' } });
    expect(ok.status).toBe(200);
    expect(ok.body.data.status).toBe('approved');
    const pub = await api().get('/api/v1/doctors');
    expect(pub.body.data[0]).toMatchObject({ name: 'ডা. মাহফুজা খাতুন (শিশু)', specialty: 'শিশু' });
    expect(pub.body.data[0]).toHaveProperty('sittingToday');

    const again = await api().post(`/api/v1/admin/submissions/${sub.body.data.id}/approve`).set(ed.auth).send({});
    expect(again.status).toBe(409);
    expect(again.body.code).toBe('ALREADY_DECIDED');

    const audit = await api().get('/api/v1/admin/audit?action=review.approve').set((await staff('admin')).auth);
    expect(audit.body.data[0].changes.name).toEqual([doctor.name, 'ডা. মাহফুজা খাতুন (শিশু)']);
  });

  it('rejects with a reason and flags repeat submitters', async () => {
    const mod = await staff('moderator');
    const a = (await api().post('/api/v1/doctors').send(doctor)).body.data.id;
    expect((await api().post(`/api/v1/admin/submissions/${a}/reject`).set(mod.auth).send({})).body.errors[0].path).toBe('reason');
    expect((await api().post(`/api/v1/admin/submissions/${a}/reject`).set(mod.auth).send({ reason: 'ভুল বা যাচাই করা যায়নি' })).body.data.status).toBe('rejected');
    await api().post('/api/v1/doctors').send(doctor);
    const q = await api().get('/api/v1/admin/submissions?status=pending').set(mod.auth);
    expect(q.body.data[0].priorRejections).toBe(1);
  });

  it('directory entries only on addable lists; institution claims publish onto the institution', async () => {
    expect((await api().post('/api/v1/directory/police').send({ name: 'থানা', phone: '01712345601', whatsapp: false, address: 'থানা রোড' })).body.code).toBe('NOT_ADDABLE');
    const ok = await api().post('/api/v1/directory/restaurant').send({ name: 'আকবরিয়া', phone: '01712345602', whatsapp: false, address: 'সাতমাথা' });
    expect(ok.status).toBe(201);

    const admin = await staff('admin');
    const inst = await api().post('/api/v1/admin/institutions').set(admin.auth).send({ name: 'বগুড়া জিলা স্কুল', type: 'secondary', address: 'সাতমাথা' });
    expect(inst.status).toBe(201);
    const m = await member();
    const claim = await api().post(`/api/v1/institutions/${inst.body.data.id}/claims`).set(m.auth).send({ name: 'মো. জাকির', role: 'প্রধান শিক্ষক', phone: '01712345603', proof: 'স্কুলের পরিচয়পত্র দেখাতে পারব' });
    expect(claim.status).toBe(201);
    await api().post(`/api/v1/admin/submissions/${claim.body.data.id}/approve`).set(admin.auth).send({});
    expect((await api().get(`/api/v1/institutions/${inst.body.data.id}`)).body.data.claimed).toBe(true);
  });
});
