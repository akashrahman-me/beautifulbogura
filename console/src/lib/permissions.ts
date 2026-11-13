import type { StaffRole } from '@/types/api';

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

/** Mirrors the API's role matrix (plans/console.md §1). The UI hides; the API enforces. */
export const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  admin: PERMISSIONS,
  moderator: ['dashboard.view', 'review.manage', 'reports.manage', 'posts.manage', 'users.manage', 'audit.view'],
  editor: ['dashboard.view', 'review.manage', 'content.manage', 'announcements.manage'],
};

export const ROLES: { value: StaffRole; label: string; description: string }[] = [
  { value: 'admin', label: 'প্রশাসক', description: 'সব কিছু, স্টাফ ও সেটিংসসহ' },
  { value: 'moderator', label: 'মডারেটর', description: 'যাচাই, রিপোর্ট, পোস্ট ও ব্যবহারকারী' },
  { value: 'editor', label: 'সম্পাদক', description: 'যাচাই, তথ্যভান্ডার ও ঘোষণা' },
];
export const roleLabel = (r: StaffRole | null) => ROLES.find((x) => x.value === r)?.label ?? 'স্টাফ নন';

export const can = (role: StaffRole | null | undefined, p: Permission) => !!role && ROLE_PERMISSIONS[role].includes(p);
