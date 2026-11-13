import type { AuditEntry } from '@/features/audit/schemas/audit.schema';

export interface Dashboard {
  kpis: {
    review: number;
    reports: number;
    postsToday: number;
    activePosts: number;
    newUsers7d: number;
    bannedUsers: number;
    donorsReady: number;
    donorsTotal: number;
  };
  /** Last 30 days, oldest first. */
  activity: { date: string; posts: number }[];
  /** Active community posts by kind. */
  postsByKind: { kind: string; label: string; count: number }[];
  /** What needs a human now: oldest pending reviews, most-reported posts, posts auto-hidden. */
  attention: { id: string; type: 'review' | 'report' | 'hidden'; title: string; sub: string; href: string; at: string }[];
  recent: AuditEntry[];
}
