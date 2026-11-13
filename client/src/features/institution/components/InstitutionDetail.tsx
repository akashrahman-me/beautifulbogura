'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError } from '@/lib/api-client';
import { applyApiErrors } from '@/lib/form';
import { bn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, TextArea, TextField } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Interactive';
import { Alert, Avatar } from '@/components/ui/Misc';
import { ContactActions, PageHeader } from '@/components/shared/Blocks';
import { Skeleton } from '@/components/shared/Skeleton';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { useClaimInstitution, useInstitution, useNotices } from '../hooks/useInstitutions';
import { CLAIM_ROLES, claimSchema, institutionTypeLabel, type ClaimIn, type ClaimInput, type Institution } from '../schemas/institution.schema';

export function InstitutionDetailSkeleton() {
  return (
    <div className="container-narrow pt-16">
      <Skeleton uniqueKey="institution-detail" viewBox="0 0 360 380" height={380}>
        <rect x="0" y="0" rx="6" width="280" height="30" />
        <rect x="0" y="50" rx="12" width="52" height="52" />
        <rect x="64" y="58" rx="4" width="120" height="14" />
        <rect x="0" y="124" rx="16" width="360" height="130" />
        <rect x="0" y="274" rx="4" width="340" height="12" />
        <rect x="0" y="296" rx="4" width="300" height="12" />
        <rect x="0" y="330" rx="12" width="170" height="44" />
      </Skeleton>
    </div>
  );
}

function ClaimDialog({ institution, open, onOpenChange }: { institution: Institution; open: boolean; onOpenChange: (o: boolean) => void }) {
  const claim = useClaimInstitution(institution.id);
  const [done, setDone] = useState(false);
  const form = useForm<ClaimIn, unknown, ClaimInput>({ resolver: zodResolver(claimSchema), defaultValues: { name: '', role: '', phone: '', email: '', proof: '', website: '' } });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) => claim.mutate(v, { onSuccess: () => setDone(true), onError: (e) => applyApiErrors(form, e) }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange} icon="verified" title="প্রতিষ্ঠানের দায়িত্ব নিন" description="যাচাইয়ের পর আপনি এই প্রতিষ্ঠানের তথ্য হালনাগাদ ও নোটিশ দিতে পারবেন।">
      {done ? (
        <Alert tone="success" title="দাবি জমা হয়েছে">অ্যাডমিন আপনার নম্বরে যোগাযোগ করে যাচাই করবেন।</Alert>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <TextField label="আপনার নাম" required {...form.register('name')} error={errors.name?.message} />
          <Select label="পদ" required placeholder="বেছে নিন" defaultValue="" options={CLAIM_ROLES} {...form.register('role')} error={errors.role?.message} />
          <TextField label="মোবাইল নম্বর" required inputMode="tel" {...form.register('phone')} error={errors.phone?.message} />
          <TextField label="ইমেইল" optional type="email" {...form.register('email')} error={errors.email?.message} />
          <TextArea label="যাচাইয়ের উপায়" required rows={3} placeholder="যেমন: প্রতিষ্ঠানের অফিস নম্বর, নিয়োগপত্র" {...form.register('proof')} error={errors.proof?.message} />
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="bb-sr" {...form.register('website')} />
          {errors.root && <Alert tone="danger" title={errors.root.message} />}
          <Button type="submit" block loading={claim.isPending}>
            দাবি জমা দিন
          </Button>
        </form>
      )}
    </Dialog>
  );
}

function Body({ i }: { i: Institution }) {
  const [claimOpen, setClaimOpen] = useState(false);
  const notices = useNotices(i.id);
  const facts = [
    ['ধরন', institutionTypeLabel(i.type)],
    ['ইআইআইএন', i.eiin && bn(i.eiin)],
    ['প্রতিষ্ঠা', i.established],
    ['প্রতিষ্ঠাতা', i.founder],
    ['এলাকা', i.area],
  ].filter(([, v]) => v);

  return (
    <div className="container-narrow flex flex-col gap-6">
      <PageHeader title={i.name} back={{ href: '/education', label: 'শিক্ষা প্রতিষ্ঠান' }} />
      <div className="flex items-center gap-3">
        <Avatar icon="school" tone="info" square size="lg" />
        <div className="bb-badges">
          <Badge tone="info">{institutionTypeLabel(i.type)}</Badge>
          {i.claimed ? <Badge tone="verified">যাচাইকৃত প্রতিষ্ঠান</Badge> : <Badge tone="neutral">যাচাই হয়নি</Badge>}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface p-4">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt className="text-caption text-ink-muted">{k}</dt>
            <dd className="m-0 text-label">{v}</dd>
          </div>
        ))}
      </dl>
      {i.about && <p className="text-body-lg">{i.about}</p>}
      {i.phone && <ContactActions phone={i.phone} copy />}
      <a className="bb-linkbtn self-start" href={`https://www.google.com/maps/search/?api=1&query=${i.lat},${i.lng}`} target="_blank" rel="noopener noreferrer">
        ম্যাপে দেখুন
      </a>

      <section className="flex flex-col gap-3">
        <h2 className="text-h2">নোটিশ</h2>
        {notices.isPending ? null : notices.isError ? (
          <ErrorState error={notices.error} onRetry={notices.refetch} />
        ) : notices.data.items.length === 0 ? (
          <p className="text-body-sm text-ink-muted">এই প্রতিষ্ঠানের কোনো নোটিশ নেই।</p>
        ) : (
          notices.data.items.map((n) => (
            <article key={n.id} className="bb-card">
              <p className="text-caption text-info">{formatDate(n.createdAt)}</p>
              <h3 className="text-h4">{n.title}</h3>
              <p className="text-body-sm text-ink-muted">{n.body}</p>
            </article>
          ))
        )}
      </section>

      {!i.claimed && (
        <Alert tone="info" title="আপনি কি এই প্রতিষ্ঠানের শিক্ষক বা কমিটির সদস্য?" action={<Button size="sm" variant="secondary" iconLeft="verified" onClick={() => setClaimOpen(true)}>দায়িত্ব নিন</Button>}>
          যাচাইয়ের পর প্রতিষ্ঠানের তথ্য হালনাগাদ ও নোটিশ দিতে পারবেন।
        </Alert>
      )}
      <ClaimDialog institution={i} open={claimOpen} onOpenChange={setClaimOpen} />
    </div>
  );
}

export function InstitutionDetail({ id }: { id: string }) {
  const { data, isPending, isError, error, refetch } = useInstitution(id);
  if (isPending) return <InstitutionDetailSkeleton />;
  if (isError)
    return error instanceof ApiError && error.status === 404 ? (
      <EmptyState icon="school" title="প্রতিষ্ঠানটি পাওয়া যায়নি" action={<Button href="/education">তালিকায় ফিরে যান</Button>} />
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    );
  return <Body i={data} />;
}
