import { api, setSession } from '@/lib/api-client';
import { env, isDemo } from '@/lib/env';
import type { AuthProvider, Session, StaffRole } from '@/types/api';

/** Only same-site paths may be returned to after sign-in (the API checks this too). */
export const safeReturnTo = (path: string | null | undefined) => (path && path.startsWith('/') && !path.startsWith('//') ? path : '/');

export const authApi = {
  /**
   * Same social sign-in as the public site, sent back to the console. In demo mode an in-browser fake
   * signs in at once as an admin.
   */
  signIn: async (provider: AuthProvider, returnTo: string) => {
    if (isDemo) {
      setSession(await api.post<Session>('/auth/demo/sign-in', { provider, app: 'console' }));
      return;
    }
    const url = new URL(`${env.NEXT_PUBLIC_API_URL}/auth/${provider}`);
    url.searchParams.set('returnTo', safeReturnTo(returnTo));
    url.searchParams.set('app', 'console');
    window.location.assign(url);
  },

  signOut: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setSession(null);
    }
  },

  /** Demo only: try the console as another role. */
  demoRole: async (role: StaffRole) => setSession(await api.post<Session>('/auth/demo/role', { role })),
};
