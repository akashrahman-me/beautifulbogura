import { describe, expect, it } from 'vitest';
import { api, member } from '../../../tests/helpers';

const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex');

describe('uploads', () => {
  it('signed in only; checks the bytes; serves photos to other origins', async () => {
    expect((await api().post('/api/v1/uploads').attach('files', PNG, 'a.png')).status).toBe(401);
    const m = await member();
    const fake = await api().post('/api/v1/uploads').set(m.auth).attach('files', Buffer.from('<?php echo 1;'), 'a.jpg');
    expect(fake.status).toBe(400);
    expect(fake.body.code).toBe('UNSUPPORTED_FILE');
    const ok = await api().post('/api/v1/uploads').set(m.auth).attach('files', PNG, 'a.png');
    expect(ok.status).toBe(201);
    const url = new URL(ok.body.data.urls[0]);
    expect(url.pathname).toMatch(/^\/uploads\/[0-9a-f]{32}\.png$/);
    const file = await api().get(url.pathname);
    expect(file.status).toBe(200);
    expect(file.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });
});
