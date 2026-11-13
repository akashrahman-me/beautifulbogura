'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { refreshAccessToken } from '@/lib/api-client';

const AUTH_ERRORS: Record<string, string> = {
  cancelled: 'সাইন ইন বাতিল করা হয়েছে।',
  not_staff: 'এই অ্যাকাউন্টে কনসোলের অনুমতি নেই।',
  provider_error: 'সাইন ইন করা যায়নি। একটু পরে আবার চেষ্টা করুন।',
};

/** Restore the session once on load; report a failed provider round-trip (`?authError=`), then tidy the URL. */
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
