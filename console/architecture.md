# Frontend Architecture Guide

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
**Data:** TanStack Query for all API data · Zustand · nuqs
**Forms:** React Hook Form + Zod
**Loading UI:** react-content-loader (skeletons, never spinners)
**Backend:** separate Express REST API at `/api/v1` (see `ARCHITECTURE.md`)

---

## 1. Rendering Strategy

All API data is fetched in the browser with TanStack Query. This gives app-like behavior: data loads once, is cached, and revisiting a screen is instant.

| Piece | Component type | Job |
|---|---|---|
| `layout.tsx`, `page.tsx` | Server Component | Static shell, metadata, reads route params, renders one feature component |
| Feature components | Client Component (`'use client'`) | Call query hooks, render skeleton / data / error |
| UI primitives | Either | Presentational only |

**Rules**

- Pages do not fetch. They render a feature component and pass route params to it.
- Components never call `fetch` or the API client directly. They use a query or mutation hook.
- Loading state is always a skeleton shaped like the final content.

**Trade-off to know:** client-only fetching means crawlers see the skeleton, not the data. That is fine for dashboards and logged-in screens. If you later add public pages that need SEO, prefetch on the server with `prefetchQuery` + `HydrationBoundary`; the same hooks keep working unchanged.

---

## 2. Folder Structure (feature-based, mirrors the backend)

```
project/
├── src/
│   ├── app/                              # Routing only
│   │   ├── (public)/                     # Landing, marketing
│   │   │   └── page.tsx
│   │   ├── account/page.tsx              # Profile, sign out, “my posts” (no login/register pages:
│   │   │                                 #   social sign-in creates the account on first use)
│   │   ├── layout.tsx                    # Root layout, <Providers>
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/auth.api.ts           # signIn(provider) redirect, signOut, /me/posts
│   │   │   ├── hooks/useAuth.ts          # useSignIn, useSignOut, useMyPosts, useManageMyPost
│   │   │   ├── components/SignInOptions.tsx, SignInDialog.tsx, RequireSignIn.tsx,
│   │   │   │              AccountButton.tsx, AccountPage.tsx, AuthBootstrap.tsx
│   │   │   └── schemas/auth.schema.ts    # providers, post kinds, MyPost
│   │   │   (session state: src/stores/session.store.ts, shared with components/shared)
│   │   └── user/
│   │       ├── api/user.api.ts           # Raw API calls
│   │       ├── api/user.keys.ts          # Query key factory
│   │       ├── hooks/                    # useUsers, useUser, useCreateUser...
│   │       ├── components/               # UserList, UserCard, UserForm
│   │       ├── skeletons/                # UserListSkeleton, UserCardSkeleton
│   │       ├── schemas/user.schema.ts    # Zod schemas + inferred types
│   │       └── index.ts                  # Public exports of the feature
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── layout/                       # Header, Sidebar, Footer
│   │   └── shared/                       # Skeleton base, QueryBoundary, EmptyState, Pagination
│   │
│   ├── lib/
│   │   ├── api-client.ts                 # fetch wrapper, token refresh, ApiError
│   │   ├── query-client.ts               # QueryClient factory + defaults
│   │   ├── env.ts                        # Validated env vars
│   │   └── utils.ts                      # cn() and small helpers
│   │
│   ├── providers/
│   │   └── Providers.tsx                 # QueryClientProvider, NuqsAdapter, Toaster
│   │
│   ├── stores/                           # Global Zustand stores (ui.store.ts)
│   ├── hooks/                            # Shared hooks (useDebounce, useMediaQuery)
│   ├── types/
│   │   └── api.ts                        # Response envelope types
│   └── proxy.ts                          # Optional early redirect (Next 16 name for middleware)
│
├── tests/                                # Playwright e2e + test setup
├── .env.example
└── package.json
```

**Import rules**

- `app/` imports from `features/` and `components/`. Nothing imports from `app/`.
- A feature imports from `components/`, `lib/`, `hooks/`, `stores/`, `types/`.
- A feature imports another feature only through its `index.ts`.
- `components/`, `lib/`, `hooks/` never import from `features/`.

---

## 3. API Contract Types

These match the backend response format exactly.

```ts
// types/api.ts
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
```

---

## 4. API Client

One place that knows about URLs, headers, tokens and error parsing.

```ts
// lib/api-client.ts
import { env } from './env';
import type { ApiSuccess, ApiFailure, Paginated } from '@/types/api';

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

// Access token lives in memory only (never localStorage)
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => { accessToken = token; };

// Single-flight refresh: many 401s trigger one refresh call
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = () => {
  refreshPromise ??= fetch(`${env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as ApiSuccess<{ accessToken: string }>;
      accessToken = json.data.accessToken;
      return accessToken;
    })
    .catch(() => null)
    .finally(() => { refreshPromise = null; });
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
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry && (await refreshAccessToken())) {
    return request<T>(path, options, false);
  }

  if (res.status === 204) return { success: true, message: '', data: undefined as T };

  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!res.ok || !json || !json.success) {
    const fail = json as ApiFailure | null;
    throw new ApiError(res.status, fail?.message ?? 'Something went wrong', fail?.code ?? 'UNKNOWN', fail?.errors);
  }

  return json;
}

export const api = {
  get: async <T>(path: string, params?: Options['params'], signal?: AbortSignal) =>
    (await request<T>(path, { params, signal })).data,

  getPaginated: async <T>(path: string, params?: Options['params'], signal?: AbortSignal): Promise<Paginated<T>> => {
    const res = await request<T[]>(path, { params, signal });
    return { items: res.data, meta: res.meta! };
  },

  post: async <T>(path: string, body?: unknown) => (await request<T>(path, { method: 'POST', body })).data,
  patch: async <T>(path: string, body?: unknown) => (await request<T>(path, { method: 'PATCH', body })).data,
  delete: async (path: string) => { await request<void>(path, { method: 'DELETE' }); },
};
```

The snippet above is the general shape. In this project `POST /auth/refresh` returns `{ data: { accessToken, user } }` and the client exposes `setSession(session | null)` instead of `setAccessToken`, so the token (memory) and the visible profile (`session.store`) always change together. See §8.

---

## 5. TanStack Query Setup

### Query client with defaults

```ts
// lib/query-client.ts
import { QueryClient, isServer } from '@tanstack/react-query';
import { ApiError } from './api-client';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,          // Cached data is fresh for 1 min: no refetch on revisit
        gcTime: 10 * 60 * 1000,        // Unused cache kept for 10 min
        refetchOnWindowFocus: false,
        retry: (count, error) => {
          if (error instanceof ApiError && error.status < 500) return false; // 4xx will not fix itself
          return count < 2;
        },
      },
      mutations: { retry: false },
    },
  });

let browserClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();     // New client per server request
  return (browserClient ??= makeQueryClient()); // One client for the whole browser session
};
```

Tune `staleTime` per query: long for rarely changing data (categories, settings), short or `0` for live data (notifications, balances).

### Providers

```tsx
// providers/Providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from '@/components/ui/sonner';
import { getQueryClient } from '@/lib/query-client';
import { AuthBootstrap } from '@/features/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <AuthBootstrap /> {/* restores the session once on load */}
      <Toaster richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from '@/providers/Providers';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 6. A Complete Feature (user)

### Schemas and types

```ts
// features/user/schemas/user.schema.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(60),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.pick({ name: true }).partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface UserListParams {
  page: number;
  limit: number;
  search?: string;
}
```

### API functions (no React here)

```ts
// features/user/api/user.api.ts
import { api } from '@/lib/api-client';
import type { User, CreateUserInput, UpdateUserInput, UserListParams } from '../schemas/user.schema';

export const userApi = {
  list: (params: UserListParams, signal?: AbortSignal) => api.getPaginated<User>('/users', { ...params }, signal),
  getById: (id: string, signal?: AbortSignal) => api.get<User>(`/users/${id}`, undefined, signal),
  create: (input: CreateUserInput) => api.post<User>('/users', input),
  update: (id: string, input: UpdateUserInput) => api.patch<User>(`/users/${id}`, input),
  remove: (id: string) => api.delete(`/users/${id}`),
};
```

### Query key factory

```ts
// features/user/api/user.keys.ts
import type { UserListParams } from '../schemas/user.schema';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

Keys are never written as inline arrays in components. Invalidating `userKeys.lists()` refreshes every page and filter of the list at once.

### Query hooks

```ts
// features/user/hooks/useUsers.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { userKeys } from '../api/user.keys';
import type { UserListParams } from '../schemas/user.schema';

export const useUsers = (params: UserListParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => userApi.list(params, signal),
    placeholderData: keepPreviousData,   // Keep the old page visible while the next one loads
  });
```

```ts
// features/user/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user.api';
import { userKeys } from '../api/user.keys';

export const useUser = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => userApi.getById(id, signal),
    enabled: Boolean(id),
  });
```

### Mutation hooks

```ts
// features/user/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../api/user.api';
import { userKeys } from '../api/user.keys';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);       // Seed the detail cache
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });  // Refresh lists
      toast.success('User created');
    },
  });
};
```

```ts
// features/user/hooks/useDeleteUser.ts  (optimistic update)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../api/user.api';
import { userKeys } from '../api/user.keys';
import type { Paginated } from '@/types/api';
import type { User } from '../schemas/user.schema';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.remove,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });
      const previous = queryClient.getQueriesData<Paginated<User>>({ queryKey: userKeys.lists() });
      queryClient.setQueriesData<Paginated<User>>({ queryKey: userKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.filter((u) => u.id !== id) } : old,
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));  // Roll back
      toast.error('Could not delete user');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });
};
```

### Component

```tsx
// features/user/components/UserList.tsx
'use client';

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useUsers } from '../hooks/useUsers';
import { UserListSkeleton } from '../skeletons/UserListSkeleton';
import { UserCard } from './UserCard';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';

export function UserList() {
  const [{ page, search }, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
  });

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useUsers({ page, limit: 20, search });

  if (isPending) return <UserListSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (data.items.length === 0) return <EmptyState title="No users found" />;

  return (
    <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
      <ul className="grid gap-3">
        {data.items.map((user) => <UserCard key={user.id} user={user} />)}
      </ul>
      <Pagination meta={data.meta} onPageChange={(p) => setParams({ page: p })} />
    </div>
  );
}
```

### Pages stay thin

```tsx
// app/(dashboard)/users/page.tsx
import type { Metadata } from 'next';
import { UserList } from '@/features/user';

export const metadata: Metadata = { title: 'Users' };

export default function UsersPage() {
  return <UserList />;
}
```

```tsx
// app/(dashboard)/users/[id]/page.tsx
import { UserDetail } from '@/features/user';

// Next 16: params is a Promise
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetail id={id} />;
}
```

---

## 7. Skeleton Loading (react-content-loader)

### The four UI states

Every data component handles all four, in this order:

| State | Condition | UI |
|---|---|---|
| Loading | `isPending` | Skeleton |
| Error | `isError` | `ErrorState` with retry |
| Empty | data has no items | `EmptyState` |
| Success | otherwise | Content |

### Which flag triggers the skeleton

- `isPending` → **show skeleton.** There is no data yet.
- `isFetching` with data present → **do not show skeleton.** It is a background refresh; keep content on screen (optionally a thin progress bar).
- `isPlaceholderData` → dim the old page slightly while the next page loads.
- Mutations → disable the button and show its pending label. No skeleton.

### Base wrapper (one place for colors, speed, accessibility)

```tsx
// components/shared/Skeleton.tsx
'use client';

import ContentLoader, { type IContentLoaderProps } from 'react-content-loader';

type Props = IContentLoaderProps & { uniqueKey: string };

export function Skeleton({ children, ...props }: Props) {
  return (
    <ContentLoader
      speed={1.4}
      backgroundColor="var(--skeleton-base)"
      foregroundColor="var(--skeleton-highlight)"
      title="Loading..."
      width="100%"
      preserveAspectRatio="none"
      {...props}
    >
      {children}
    </ContentLoader>
  );
}
```

```css
/* app/globals.css */
:root  { --skeleton-base: #e9ecef; --skeleton-highlight: #f6f7f8; }
.dark  { --skeleton-base: #26282c; --skeleton-highlight: #33363b; }
```

`uniqueKey` is required in this wrapper on purpose. Without it the library generates a random id, which differs between server render and browser and causes a hydration warning in Next.js.

If CSS variables do not render in the gradient on a browser you support, pass hex colors from a theme hook instead.

### Feature skeletons mirror the real layout

```tsx
// features/user/skeletons/UserCardSkeleton.tsx
'use client';

import { Skeleton } from '@/components/shared/Skeleton';

export function UserCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <Skeleton uniqueKey={`user-card-${index}`} viewBox="0 0 400 72" height={72}>
      <circle cx="36" cy="36" r="24" />                        {/* avatar */}
      <rect x="76" y="18" rx="4" ry="4" width="160" height="14" />  {/* name */}
      <rect x="76" y="42" rx="4" ry="4" width="220" height="10" />  {/* email */}
      <rect x="340" y="26" rx="10" ry="10" width="48" height="20" /> {/* role badge */}
    </Skeleton>
  );
}
```

```tsx
// features/user/skeletons/UserListSkeleton.tsx
'use client';

import { UserCardSkeleton } from './UserCardSkeleton';

export function UserListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid gap-3" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}><UserCardSkeleton index={i} /></li>
      ))}
    </ul>
  );
}
```

### Skeleton rules

1. One skeleton per data component, stored in the feature's `skeletons/` folder and named `<Component>Skeleton`.
2. Same outer height and spacing as the real component, so nothing jumps when data arrives.
3. Build the skeleton right after the component, using its real measurements. The [create-content-loader](https://danilowoz.com/create-content-loader) tool helps draw shapes.
4. Skeleton count matches the page size roughly (8 to 10 rows for a list of 20 is enough).
5. No text like "Loading..." on screen and no spinners for data. Spinners are allowed only inside buttons during a mutation.
6. `loading.tsx` in a route folder renders the same skeleton component, so route transitions and data loading look identical.

---

## 8. Authentication (social sign-in)

Reading is open to everyone. Anything that **creates something owned by a person** (community posts: jobs, buy & sell, to-let, car rent, tuition) needs a signed-in user. There are no passwords, no PINs and no sign-up page: the user picks **Google, Facebook or Apple**, and the first sign-in creates the account.

**Flow**

1. A signed-out visitor opens a “post” form. `RequireSignIn` shows the provider buttons *before* the form, so nothing typed is lost on the provider round-trip.
2. `signIn(provider)` does a full-page navigation to `GET {API}/auth/:provider?returnTo=/jobs/new`. The API runs the OAuth / OpenID Connect flow (state + PKCE), upserts the user by `(provider, providerUserId)`, sets the **refresh token as an httpOnly cookie** and redirects back to `returnTo` (same-site paths only). On failure it redirects to `/?authError=<code>`.
3. On app start, `AuthBootstrap` calls `POST /auth/refresh` once. The response `{ accessToken, user }` goes through `setSession()`: token in memory, profile in `useSessionStore` (`unknown → signed-in | signed-out`).
4. Any 401 triggers one silent refresh and a retry (API client). A failed refresh signs the user out locally.
5. Ownership: the API stamps `ownerId` on create and only the owner may `PATCH` or `POST …/manage` (403 `NOT_OWNER`). The UI shows “পোস্ট পরিচালনা” only when `user.id === post.ownerId`, and `/account` lists everything the user owns (`GET /me/posts`).
6. Sign out: `POST /auth/logout` clears the cookie; the client calls `setSession(null)` and drops the `['me']` queries. Post lists are public data, so they stay cached.

```tsx
// a post form
<RequireSignIn>
  <form onSubmit={submit}>…</form>
</RequireSignIn>

// owner controls on a post
<PostActions id={post.id} ownerId={post.ownerId} manage={manage} report={report} doneLabel="ভাড়া হয়ে গেছে" />
```

**Demo mode** (`NEXT_PUBLIC_DATA_MODE=demo`) has no provider to redirect to: `signIn` calls `POST /auth/demo/sign-in` on the in-browser fake, which signs in a fixed demo user and keeps the session in localStorage so reloads stay signed in. The first seeded post of each kind belongs to that user.

**Cookie and domain note:** the refresh cookie belongs to the API's domain. Host the frontend and API on the same site (`example.com` and `api.example.com`) so the cookie is sent with `sameSite: 'lax'`. On unrelated domains you need `sameSite: 'none'; secure`, which some browsers block.

**The frontend guard is for user experience only.** Real access control is the API rejecting requests without a valid token or from a non-owner.

---

## 9. Forms

React Hook Form + Zod, with server validation errors mapped back onto fields.

```tsx
// features/user/components/UserForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema';
import { useCreateUser } from '../hooks/useCreateUser';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function UserForm({ onDone }: { onDone?: () => void }) {
  const { mutate, isPending } = useCreateUser();
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutate(values, {
      onSuccess: () => { form.reset(); onDone?.(); },
      onError: (error) => {
        if (!(error instanceof ApiError)) return form.setError('root', { message: 'Something went wrong' });

        // Field errors from the API: [{ path: 'email', message: '...' }]
        error.errors?.forEach((e) => form.setError(e.path as keyof CreateUserInput, { message: e.message }));

        // Business errors by code
        if (error.code === 'EMAIL_TAKEN') form.setError('email', { message: 'This email is already registered' });
        else if (!error.errors) form.setError('root', { message: error.message });
      },
    }),
  );

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div>
        <Input placeholder="Name" {...form.register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Input type="email" placeholder="Email" {...form.register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Input type="password" placeholder="Password" {...form.register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
      <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create user'}</Button>
    </form>
  );
}
```

Switch on `error.code`, never on `error.message`. Codes are stable; messages can change.

---

## 10. State: Where Each Kind Lives

| State | Tool | Examples |
|---|---|---|
| Server data | TanStack Query | Users, posts, current user profile |
| URL state | nuqs | Page number, search, filters, sort, active tab |
| Global client state | Zustand | Session (signed-in user), recently viewed, favourites |
| Local UI state | `useState` | Modal open, input value, hover |
| Form state | React Hook Form | Field values, errors, dirty |

**Rules**

- Never copy server data into Zustand or `useState`. Read it from the query hook wherever it is needed; the cache deduplicates.
- Anything a user would expect to survive a refresh or be shareable by link goes in the URL.
- Zustand stores stay small and are selected by field: `useStore((s) => s.field)`.

---

## 11. Error Handling

| Where | Handles |
|---|---|
| `ErrorState` component | Query failures, with a Retry button calling `refetch` |
| Form `setError` | Validation and business errors on mutations |
| `toast` in mutation hooks | Success and generic failure messages |
| `app/error.tsx` | Render crashes (must be a client component) |
| `app/not-found.tsx` | Unknown routes; call `notFound()` for a 404 from the API |
| API client | 401 refresh and retry; converts every failure to `ApiError` |

```tsx
// components/shared/ErrorState.tsx
'use client';

import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Could not load data. Check your connection.';
  return (
    <div role="alert" className="grid place-items-center gap-3 py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
```

---

## 12. Environment Variables

```ts
// lib/env.ts
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),   // e.g. https://api.example.com/api/v1
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// NEXT_PUBLIC_ vars must be referenced literally to be inlined at build time
export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
```

Anything prefixed `NEXT_PUBLIC_` ships to the browser. No secrets there.

---

## 13. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `UserCard.tsx` |
| Skeleton | `<Component>Skeleton` | `UserCardSkeleton.tsx` |
| Hook | `use` + camelCase | `useUsers.ts`, `useCreateUser.ts` |
| API module | `<feature>.api.ts` | `user.api.ts` |
| Query keys | `<feature>.keys.ts` | `user.keys.ts` |
| Schema | `<feature>.schema.ts` | `user.schema.ts` |
| Store | `<name>.store.ts` | `session.store.ts` |
| Route folders | kebab-case | `app/(dashboard)/order-history/` |
| Feature folders | singular | `features/user/` |

**Hook names**

| Operation | Hook | Type |
|---|---|---|
| List | `useUsers(params)` | query |
| Get one | `useUser(id)` | query |
| Create | `useCreateUser()` | mutation |
| Update | `useUpdateUser()` | mutation |
| Delete | `useDeleteUser()` | mutation |

Use named exports everywhere except `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, which Next.js requires as default exports.

---

## 14. Styling

- Tailwind v4 utilities; design tokens (colors, radius, fonts) defined as CSS variables in `globals.css`
- shadcn/ui components live in `components/ui/` and are edited freely; they are your code
- `cn()` helper (`clsx` + `tailwind-merge`) for conditional classes
- Mobile-first: base styles for small screens, then `md:` and `lg:`
- Dark mode through the `.dark` class and CSS variables (`next-themes`)
- No inline hex colors in components; use tokens

---

## 15. Performance

- `next/image` for all images, `next/font` for fonts
- `next/link` for navigation (prefetches routes automatically)
- Prefetch data on hover for instant detail pages:
  ```ts
  queryClient.prefetchQuery({ queryKey: userKeys.detail(id), queryFn: () => userApi.getById(id) });
  ```
- `dynamic(() => import(...))` for heavy client-only widgets (charts, editors)
- Debounce search inputs before they reach the query key
- Pass `signal` to the API so abandoned requests are cancelled
- React Compiler on; avoid manual `useMemo` / `useCallback` unless profiling shows a need

---

## 16. Testing

| Type | Tool | Scope |
|---|---|---|
| Unit | Vitest | Utils, schemas, stores |
| Component | Vitest + Testing Library + MSW | Feature components with mocked API, including skeleton and error states |
| End-to-end | Playwright | Sign-in (demo mode), posting, core flows against a running API |

In component tests, wrap with a fresh `QueryClient` per test and set `retry: false`.

---

## 17. Tooling

- pnpm, TypeScript `strict: true`, path alias `@/*` → `src/*`
- ESLint + Prettier (with `prettier-plugin-tailwindcss`) or Biome
- `@tanstack/eslint-plugin-query` to catch missing query-key dependencies
- Husky + lint-staged
- TanStack Query Devtools in development

---

## 18. Checklist

- [ ] Pages are thin; all data comes through query hooks
- [ ] One API client; components never call `fetch`
- [ ] Query key factory per feature; no inline key arrays
- [ ] Sensible `staleTime` per query
- [ ] Mutations invalidate or update the affected keys
- [ ] Every data component handles loading, error, empty, success
- [ ] Skeleton for every data component, matching its layout, with `uniqueKey`
- [ ] No spinners or "Loading..." text for data
- [ ] `keepPreviousData` on paginated lists
- [ ] Filters, search and pagination stored in the URL
- [ ] Access token in memory only; refresh via httpOnly cookie
- [ ] Query cache cleared on logout
- [ ] Forms validated with Zod; server errors mapped to fields by `code`
- [ ] Env vars validated; no secrets in `NEXT_PUBLIC_*`
- [ ] Feature import boundaries respected

---

## 19. Build Order for a New Feature

1. `schemas/` — Zod schemas and types
2. `api/*.api.ts` — endpoint functions
3. `api/*.keys.ts` — query key factory
4. `hooks/` — query and mutation hooks
5. `components/` — UI using the hooks
6. `skeletons/` — one per data component
7. `index.ts` — export the public surface
8. `app/.../page.tsx` — route that renders the feature
9. Tests