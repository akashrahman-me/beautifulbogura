import { api, setSession } from '@/lib/api-client';
import { env, isDemo } from '@/lib/env';
import type { ManageAction } from '@/types/api';
import { POST_KINDS, type AuthProvider, type MyPost, type PostKind, type Session } from '../schemas/auth.schema';

/** Only same-site paths may be returned to after sign-in (the API checks this too). */
export const safeReturnTo = (path: string) => (path.startsWith('/') && !path.startsWith('//') ? path : '/');

export const authApi = {
  /**
   * Social sign-in. In `api` mode this is a full-page navigation: the API redirects to the provider,
   * handles the callback, creates the account on first sign-in, sets the httpOnly refresh cookie and
   * sends the browser back to `returnTo`. In demo mode an in-browser fake signs in straight away.
   */
  signIn: async (provider: AuthProvider, returnTo: string) => {
    if (isDemo) {
      setSession(await api.post<Session>('/auth/demo/sign-in', { provider }));
      return;
    }
    const url = new URL(`${env.NEXT_PUBLIC_API_URL}/auth/${provider}`);
    url.searchParams.set('returnTo', safeReturnTo(returnTo));
    window.location.assign(url);
  },

  signOut: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setSession(null);
    }
  },

  myPosts: (signal?: AbortSignal) => api.get<MyPost[]>('/me/posts', undefined, signal),

  managePost: (kind: PostKind, id: string, body: ManageAction) => api.post<{ ok: true }>(`${POST_KINDS[kind].base}/${id}/manage`, body),
};
