'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { isDemo } from '@/lib/env';
import { Icon } from '@/components/ui/Icon';
import { Alert, Bricks, Wordmark } from '@/components/ui/Misc';
import type { AuthProvider } from '@/types/api';
import { safeReturnTo } from '../api/auth.api';
import { useSession, useSignIn } from '../hooks/useAuth';
import { ProviderLogo } from './ProviderLogo';

const PROVIDERS: { id: AuthProvider; label: string }[] = [
  { id: 'google', label: 'Google দিয়ে সাইন ইন' },
  { id: 'facebook', label: 'Facebook দিয়ে সাইন ইন' },
  { id: 'apple', label: 'Apple দিয়ে সাইন ইন' },
];

const returnTo = () => safeReturnTo(new URLSearchParams(window.location.search).get('next'));

export function LoginPage() {
  const user = useSession();
  const router = useRouter();
  const signIn = useSignIn();
  const [busy, setBusy] = useState<AuthProvider | null>(null);

  // Already signed in as staff: straight to where they were going.
  useEffect(() => {
    if (user?.role) router.replace(returnTo());
  }, [user, router]);

  const go = (provider: AuthProvider) => {
    setBusy(provider);
    signIn.mutate({ provider, returnTo: returnTo() }, { onSettled: () => setBusy(null) });
  };

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-brand lg:block" aria-hidden>
        <Bricks rows={24} cols={30} sparse className="absolute inset-x-0 top-0 h-3/5 w-full text-[var(--on-brand)] opacity-10" />
        <div className="relative flex h-full flex-col justify-end gap-3 p-12 text-[var(--on-brand)]">
          <p className="text-overline opacity-80">বিউটিফুল বগুড়া</p>
          <p className="text-display-lg">কনসোল</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Wordmark tagline="কনসোল" />
          <div className="flex flex-col gap-1">
            <h1 className="text-h1">সাইন ইন করুন</h1>
            <p className="text-body-sm text-ink-muted">শুধু অনুমতিপ্রাপ্ত স্টাফদের জন্য।</p>
          </div>
          {user && !user.role && (
            <Alert tone="danger" title="এই অ্যাকাউন্টে কনসোলের অনুমতি নেই">
              প্রশাসককে আপনার ইমেইল দিয়ে আমন্ত্রণ পাঠাতে বলুন, অথবা অন্য অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            {PROVIDERS.map((p) => (
              <button key={p.id} type="button" className={cn('bb-btn bb-btn-secondary bb-btn-lg bb-btn-block', busy === p.id && 'is-loading')} disabled={busy !== null} aria-busy={busy === p.id || undefined} onClick={() => go(p.id)}>
                {busy === p.id ? <span className="bb-spinner" aria-hidden /> : <ProviderLogo provider={p.id} />}
                <span className="bb-btn-label">{p.label}</span>
              </button>
            ))}
          </div>
          {signIn.isError && <Alert tone="danger" title={signIn.error.message} />}
          <p className="text-caption flex gap-2 text-ink-muted">
            <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
            সব কাজ অডিট লগে নাম ও সময়সহ সংরক্ষিত থাকে।
          </p>
          {isDemo && <p className="text-caption text-ink-subtle">ডেমো মোড: যেকোনো বোতামে প্রশাসক হিসেবে ঢুকবেন।</p>}
        </div>
      </section>
    </main>
  );
}
