import { describe, expect, it } from 'vitest';
import { can, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/permissions';
import { youtubeId } from '@/features/videos/schemas/video.schema';
import { safeReturnTo } from '@/features/auth/api/auth.api';

describe('role matrix', () => {
  it('gives admins everything', () => {
    expect(ROLE_PERMISSIONS.admin).toEqual(PERMISSIONS);
  });
  it('keeps moderators out of content, staff and settings', () => {
    expect(can('moderator', 'reports.manage')).toBe(true);
    expect(can('moderator', 'content.manage')).toBe(false);
    expect(can('moderator', 'staff.manage')).toBe(false);
  });
  it('keeps editors out of moderation and the voter roll', () => {
    expect(can('editor', 'content.manage')).toBe(true);
    expect(can('editor', 'reports.manage')).toBe(false);
    expect(can('editor', 'voters.manage')).toBe(false);
  });
  it('gives non-staff nothing', () => {
    expect(can(null, 'dashboard.view')).toBe(false);
  });
});

describe('YouTube links', () => {
  it('accepts the usual link shapes and bare ids', () => {
    expect(youtubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(youtubeId('not a video')).toBeNull();
  });
});

describe('sign-in return path', () => {
  it('only returns inside the console', () => {
    expect(safeReturnTo('/reports?status=open')).toBe('/reports?status=open');
    expect(safeReturnTo('//evil.example')).toBe('/');
    expect(safeReturnTo(null)).toBe('/');
  });
});
