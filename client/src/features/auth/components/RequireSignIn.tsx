'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Misc';
import { Icon } from '@/components/ui/Icon';
import { FormSkeleton } from '@/components/shared/Skeleton';
import { useSession, useSessionStatus } from '../hooks/useAuth';
import { SignInOptions } from './SignInOptions';

/**
 * Gate in front of every “post something” form. Signed-out visitors see the provider buttons
 * before they type anything, so nothing is lost on the trip to Google / Facebook / Apple.
 */
export function RequireSignIn({ children, title = 'পোস্ট দিতে সাইন ইন করুন' }: { children: ReactNode; title?: string }) {
  const status = useSessionStatus();
  const user = useSession();

  if (status === 'unknown') return <FormSkeleton fields={5} />;

  if (!user) {
    return (
      <section className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-5" aria-labelledby="signin-gate-title">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon name="user" size={22} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="signin-gate-title" className="text-h3">
              {title}
            </h2>
            <p className="text-body text-ink-muted">কোনো পাসওয়ার্ড বা পিন মনে রাখতে হবে না। সাইন ইন করলে আপনার সব পোস্ট এক জায়গা থেকে সম্পাদনা, মুছে ফেলা বা ‘সম্পন্ন’ করতে পারবেন।</p>
          </div>
        </div>
        <SignInOptions />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3">
        <Avatar name={user.name} src={user.avatar} size="sm" />
        <p className="text-label min-w-0 flex-1 truncate">
          <span className="text-ink-muted">পোস্ট করছেন: </span>
          {user.name}
        </p>
        <Link href="/account" className="bb-linkbtn text-sm">
          আমার পোস্ট
        </Link>
      </div>
      {children}
    </div>
  );
}
