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

/** Every admin list accepts these, plus its own filters. */
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  /** `field` or `-field` for descending. */
  sort?: string;
}

export type AuthProvider = 'google' | 'facebook' | 'apple';
export type StaffRole = 'admin' | 'moderator' | 'editor';

/** A signed-in console user. `role` is null for accounts that are not staff. */
export interface StaffUser {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  provider: AuthProvider;
  role: StaffRole | null;
}

export interface Session {
  accessToken: string;
  user: StaffUser;
}

/** A reason given for a consequential action (reject, remove, ban). Shown to the affected person where relevant. */
export interface ReasonInput {
  reason: string;
  note?: string;
}
