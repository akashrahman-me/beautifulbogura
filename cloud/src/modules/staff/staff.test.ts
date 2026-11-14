import { beforeEach, describe, expect, it } from 'vitest';
import { api, CONSOLE, resetDb, signIn, staff } from '../../../tests/helpers';

beforeEach(resetDb);

describe('staff', () => {
  it('an invite becomes the role when that email first signs in', async () => {
    const admin = await staff('admin');
    const inv = await api().post('/api/v1/admin/staff').set(admin.auth).send({ email: 'new@example.com', role: 'editor' });
    expect(inv.status).toBe(201);
    expect(inv.body.data.status).toBe('invited');
    expect((await api().post('/api/v1/admin/staff').set(admin.auth).send({ email: 'new@example.com', role: 'editor' })).body.code).toBe('STAFF_EXISTS');
    const s = await signIn('new@example.com', { app: 'console' });
    expect(s.user?.role).toBe('editor');
    const list = await api().get('/api/v1/admin/staff').set(admin.auth);
    expect(list.body.data.find((x: { email: string }) => x.email === 'new@example.com').status).toBe('active');
  });

  it('protects self and the last admin; removal signs them out of the console and can be undone', async () => {
    const admin = await staff('admin');
    expect((await api().post(`/api/v1/admin/staff/${admin.user!.id}/role`).set(admin.auth).send({ role: 'editor' })).body.code).toBe('SELF');
    const ed = await staff('editor');
    expect((await api().post(`/api/v1/admin/staff/${ed.user!.id}/role`).set(admin.auth).send({ role: 'moderator' })).body.data.role).toBe('moderator');
    expect((await api().delete(`/api/v1/admin/staff/${ed.user!.id}`).set(admin.auth)).status).toBe(204);
    expect((await api().get('/api/v1/admin/counts').set(ed.auth)).status).toBe(403);
    expect((await api().post('/api/v1/auth/refresh').set('Origin', CONSOLE).set('Cookie', ed.cookie!)).status).toBe(401);
    expect((await api().post(`/api/v1/admin/staff/${ed.user!.id}/restore`).set(admin.auth)).status).toBe(200);

    const other = await staff('admin');
    await api().delete(`/api/v1/admin/staff/${other.user!.id}`).set(admin.auth);
    const last = await api().post(`/api/v1/admin/staff/${admin.user!.id}/role`).set(other.auth).send({ role: 'editor' });
    expect(last.status).toBe(403); // `other` is no longer staff
  });
});
