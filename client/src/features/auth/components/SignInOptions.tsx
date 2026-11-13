'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Alert } from '@/components/ui/Misc';
import { useSignIn } from '../hooks/useAuth';
import { PROVIDERS, type AuthProvider } from '../schemas/auth.schema';
import { ProviderLogo } from './ProviderLogo';

/**
 * One button per provider. The first sign-in creates the account — there is no sign-up page.
 * After the provider round-trip the browser comes back to `returnTo` (default: this page).
 */
export function SignInOptions({ returnTo, onSignedIn }: { returnTo?: string; onSignedIn?: () => void }) {
  const signIn = useSignIn();
  const [busy, setBusy] = useState<AuthProvider | null>(null);

  const go = (provider: AuthProvider) => {
    setBusy(provider);
    signIn.mutate(
      { provider, returnTo: returnTo ?? window.location.pathname + window.location.search },
      // In api mode the page navigates away, so success only lands here in demo mode.
      { onSuccess: () => onSignedIn?.(), onSettled: () => setBusy(null) },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cn('bb-btn bb-btn-secondary bb-btn-lg bb-btn-block', busy === p.id && 'is-loading')}
          disabled={busy !== null}
          aria-busy={busy === p.id || undefined}
          onClick={() => go(p.id)}
        >
          {busy === p.id ? <span className="bb-spinner" aria-hidden /> : <ProviderLogo provider={p.id} />}
          <span className="bb-btn-label">{p.label}</span>
        </button>
      ))}
      {signIn.isError && <Alert tone="danger" title={signIn.error.message} />}
      <p className="text-caption text-ink-muted">
        আলাদা অ্যাকাউন্ট খুলতে হয় না — প্রথমবার সাইন ইন করলেই আপনার অ্যাকাউন্ট তৈরি হয়ে যাবে। আমরা শুধু আপনার নাম, ইমেইল ও প্রোফাইল ছবি নিই; আপনার অনুমতি ছাড়া কোথাও কিছু পোস্ট করি না।
      </p>
    </div>
  );
}
