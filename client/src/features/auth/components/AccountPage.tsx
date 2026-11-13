'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Interactive';
import { Avatar } from '@/components/ui/Misc';
import { PageHeader } from '@/components/shared/Blocks';
import { CardGridSkeleton, FormSkeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useManageMyPost, useMyPosts, useSession, useSessionStatus, useSignOut } from '../hooks/useAuth';
import { POST_KINDS, type MyPost } from '../schemas/auth.schema';
import { PROVIDER_NAME, ProviderLogo } from './ProviderLogo';
import { SignInOptions } from './SignInOptions';

const NEW_POST_LINKS = [
  { href: '/jobs/new', label: 'চাকরির বিজ্ঞাপন' },
  { href: '/buy-sell/new', label: 'বিক্রির বিজ্ঞাপন' },
  { href: '/to-let/new', label: 'বাসা ভাড়া' },
  { href: '/car-rent/new', label: 'গাড়ি ভাড়া' },
  { href: '/tuition/new', label: 'টিউশন' },
];

export function AccountPage() {
  const status = useSessionStatus();
  const user = useSession();
  const signOut = useSignOut();

  if (status === 'unknown') {
    return (
      <div className="container-narrow flex flex-col gap-5">
        <PageHeader title="আমার অ্যাকাউন্ট" />
        <FormSkeleton fields={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-narrow flex flex-col gap-5">
        <PageHeader title="সাইন ইন করুন" description="আপনার পোস্টগুলো দেখতে ও সামলাতে Google, Facebook বা Apple দিয়ে সাইন ইন করুন।" />
        <section className="rounded-lg border border-line bg-surface p-5">
          <SignInOptions returnTo="/account" />
        </section>
      </div>
    );
  }

  return (
    <div className="container-narrow flex flex-col gap-6">
      <PageHeader title="আমার অ্যাকাউন্ট" />
      <section className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-5">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-h3 truncate">{user.name}</p>
          {user.email && <p className="text-body truncate text-ink-muted">{user.email}</p>}
          <p className="text-caption flex items-center gap-1.5 text-ink-muted">
            <ProviderLogo provider={user.provider} size={14} />
            {PROVIDER_NAME[user.provider]} দিয়ে সাইন ইন করা
          </p>
        </div>
        <Button variant="secondary" size="sm" iconLeft="external" loading={signOut.isPending} onClick={() => signOut.mutate()}>
          সাইন আউট
        </Button>
      </section>
      <MyPosts />
    </div>
  );
}

function MyPosts() {
  const { data, isPending, isError, error, refetch } = useMyPosts();

  return (
    <section className="flex flex-col gap-4" aria-labelledby="my-posts">
      <h2 id="my-posts" className="text-h2">
        আমার পোস্ট
      </h2>
      {isPending ? (
        <CardGridSkeleton count={3} height={120} keyPrefix="mine" />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon="document" title="এখনো কোনো পোস্ট দেননি">
          <span className="flex flex-wrap justify-center gap-2 pt-2">
            {NEW_POST_LINKS.map((l) => (
              <Button key={l.href} href={l.href} size="sm" variant="secondary" iconLeft="plus">
                {l.label}
              </Button>
            ))}
          </span>
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((p) => (
            <MyPostRow key={`${p.kind}-${p.id}`} post={p} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MyPostRow({ post }: { post: MyPost }) {
  const kind = POST_KINDS[post.kind];
  const manage = useManageMyPost();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const active = post.status === 'active';

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand" icon={null}>
          {kind.label}
        </Badge>
        {active ? (
          <Badge tone="success" dot>
            চালু আছে
          </Badge>
        ) : (
          <Badge tone="neutral" icon="check">
            {kind.doneBadge}
          </Badge>
        )}
        <span className="text-caption ml-auto text-ink-muted">{formatDate(post.createdAt)}</span>
      </div>
      <Link href={post.href} className="text-h4 hover:underline">
        {post.title}
      </Link>
      <div className="flex flex-wrap gap-2">
        {active && kind.doneLabel && (
          <Button size="sm" variant="secondary" iconLeft="check" loading={manage.isPending && manage.variables?.action === 'mark-done'} onClick={() => manage.mutate({ kind: post.kind, id: post.id, action: 'mark-done' })}>
            {kind.doneLabel}
          </Button>
        )}
        <Button size="sm" variant="danger-ghost" iconLeft="trash" disabled={manage.isPending} onClick={() => setConfirmDelete(true)}>
          মুছে ফেলুন
        </Button>
      </div>
      <Dialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        icon="trash"
        tone="emergency"
        title="পোস্টটি মুছে ফেলবেন?"
        description="মুছে ফেলা পোস্ট আর ফিরিয়ে আনা যাবে না।"
        actions={
          <>
            <Button variant="emergency" iconLeft="trash" block loading={manage.isPending} onClick={() => manage.mutate({ kind: post.kind, id: post.id, action: 'delete' }, { onSuccess: () => setConfirmDelete(false) })}>
              হ্যাঁ, মুছে ফেলুন
            </Button>
            <Button variant="ghost" block onClick={() => setConfirmDelete(false)}>
              বাতিল
            </Button>
          </>
        }
      />
    </li>
  );
}
