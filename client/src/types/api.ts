export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  code: string;
  errors?: { path: string; message: string }[];
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Query params every list endpoint accepts. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** Social sign-in providers. Signing in the first time creates the account; there is no separate sign-up. */
export type AuthProvider = 'google' | 'facebook' | 'apple';

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  provider: AuthProvider;
}

/** What `/auth/refresh` returns: a short-lived access token (kept in memory) and who it belongs to. */
export interface Session {
  accessToken: string;
  user: SessionUser;
}

/** Owner-only actions on a community post. The server checks ownership from the session. */
export interface ManageAction {
  action: 'delete' | 'mark-done';
}

export interface ReportInput {
  reason: 'fake' | 'sold' | 'wrong-info' | 'other';
  note?: string;
}

export interface Submission {
  id: string;
  status: 'pending' | 'published';
}
