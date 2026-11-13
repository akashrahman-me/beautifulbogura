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

/** Body for PIN-gated actions on anonymous community posts. */
export interface PinAction {
  pin: string;
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
