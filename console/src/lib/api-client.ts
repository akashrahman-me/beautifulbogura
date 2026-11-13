import { env, isDemo } from './env';
import { useSessionStore } from '@/stores/session.store';
import type { ApiFailure, ApiSuccess, Paginated, Session, StaffUser } from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
    public errors?: ApiFailure['errors'],
  ) {
    super(message);
  }
}

// Access token in memory only. The refresh token is an httpOnly cookie set after social sign-in.
let accessToken: string | null = null;

/** Store a fresh session (or clear it). Keeps the token and the visible profile in step. */
export const setSession = (session: Session | null) => {
  accessToken = session?.accessToken ?? null;
  useSessionStore.getState().setUser(session?.user ?? null);
};

// Demo mode swaps the network for an in-browser fake of the same API. Chosen by env, never as a fallback.
const transport: typeof fetch = isDemo
  ? (input, init) => import('@/mocks/demo-server').then((m) => m.demoFetch(input, init))
  : (input, init) => fetch(input, init);

let refreshPromise: Promise<StaffUser | null> | null = null;

/** Exchange the refresh cookie for an access token. Resolves to the user, or null when signed out. */
export const refreshAccessToken = () => {
  refreshPromise ??= transport(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) {
        setSession(null);
        return null;
      }
      const json = (await res.json()) as ApiSuccess<Session>;
      setSession(json.data);
      return json.data.user;
    })
    .catch(() => {
      if (useSessionStore.getState().status === 'unknown') useSessionStore.getState().setUser(null);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

type Options = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
};

async function request<T>(path: string, options: Options = {}, retry = true): Promise<ApiSuccess<T>> {
  const { body, params, headers, ...rest } = options;
  const url = new URL(`${env.NEXT_PUBLIC_API_URL}${path}`);
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== false) url.searchParams.set(k, String(v));
  });
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  let res: Response;
  try {
    res = await transport(url, {
      ...rest,
      credentials: 'include',
      headers: {
        ...(body !== undefined && !isForm && { 'Content-Type': 'application/json' }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError(0, 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখুন।', 'NETWORK');
  }

  if (res.status === 401 && retry && (await refreshAccessToken())) return request<T>(path, options, false);
  if (res.status === 204) return { success: true, message: '', data: undefined as T };

  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!res.ok || !json || !json.success) {
    const fail = json as ApiFailure | null;
    throw new ApiError(res.status, fail?.message ?? 'কিছু একটা সমস্যা হয়েছে', fail?.code ?? 'UNKNOWN', fail?.errors);
  }
  return json;
}

export type Params = Options['params'];

export const api = {
  get: async <T>(path: string, params?: Params, signal?: AbortSignal) => (await request<T>(path, { params, signal })).data,
  getPaginated: async <T>(path: string, params?: Params, signal?: AbortSignal): Promise<Paginated<T>> => {
    const res = await request<T[]>(path, { params, signal });
    return { items: res.data, meta: res.meta! };
  },
  post: async <T>(path: string, body?: unknown) => (await request<T>(path, { method: 'POST', body })).data,
  patch: async <T>(path: string, body?: unknown) => (await request<T>(path, { method: 'PATCH', body })).data,
  put: async <T>(path: string, body?: unknown) => (await request<T>(path, { method: 'PUT', body })).data,
  delete: async (path: string, body?: unknown) => {
    await request<void>(path, { method: 'DELETE', body });
  },
};
