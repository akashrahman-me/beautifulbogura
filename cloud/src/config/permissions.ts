/** Staff roles and what each may do. Mirrors console/src/lib/permissions.ts — keep both in step. */
export const ROLES = ['admin', 'moderator', 'editor'] as const;
export type StaffRole = (typeof ROLES)[number];

export const PERMISSIONS = [
  'dashboard.view',
  'review.manage',
  'reports.manage',
  'posts.manage',
  'users.manage',
  'content.manage',
  'announcements.manage',
  'voters.manage',
  'staff.manage',
  'settings.manage',
  'audit.view',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  admin: PERMISSIONS,
  moderator: ['dashboard.view', 'review.manage', 'reports.manage', 'posts.manage', 'users.manage', 'audit.view'],
  editor: ['dashboard.view', 'review.manage', 'content.manage', 'announcements.manage'],
};

export const can = (role: StaffRole | null | undefined, p: Permission) => !!role && ROLE_PERMISSIONS[role].includes(p);
