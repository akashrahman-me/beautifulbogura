'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { refreshAccessToken } from '@/lib/api-client';
import { AUTH_ERRORS } from '../schemas/auth.schema';

/**
 * On first load: restore the session from the refresh cookie, and report a failed provider
 * round-trip (`?authError=code`, set by the API's OAuth callback) once, then tidy the URL.
 */
export function AuthBootstrap() {
  useEffect(() => {
    void refreshAccessToken();

    const url = new URL(window.location.href);
    const code = url.searchParams.get('authError');
    if (code) {
      toast.error(AUTH_ERRORS[code] ?? AUTH_ERRORS.provider_error);
      url.searchParams.delete('authError');
      window.history.replaceState(window.history.state, '', url);
    }
  }, []);
  return null;
}
