import type { AuthProvider, ListQuery } from '@/types/api';

/** A public account (anyone who signed in on the site to post). */
export interface PublicUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  provider: AuthProvider;
  status: 'active' | 'banned';
  joinedAt: string;
  lastSeenAt: string;
  posts: number;
  activePosts: number;
  removedPosts: number;
  reportsAgainst: number;
  ban: { reason: string; at: string; by: string } | null;
}

export interface UserQuery extends ListQuery {
  status?: PublicUser['status'];
  provider?: AuthProvider;
}

export const BAN_REASONS = ['ভুয়া বা প্রতারণামূলক পোস্ট', 'বারবার নিয়ম ভঙ্গ', 'হয়রানি বা অশালীন আচরণ', 'ভুয়া বায়োডাটা', 'স্প্যাম'];
