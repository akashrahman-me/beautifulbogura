'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNow } from '@/hooks/useNow';
import { applyApiErrors } from '@/lib/form';
import { bn, daysSince, formatDate, telHref } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Dialog } from '@/components/ui/Interactive';
import { Alert, MetaList } from '@/components/ui/Misc';
import { useUpdateLastDonation } from '../hooks/useDonors';
import { DONATION_GAP_DAYS, updateDonationSchema, type Donor, type UpdateDonationIn, type UpdateDonationInput } from '../schemas/donor.schema';

export function donorStatus(lastDonation: string | null, now: Date) {
  if (!lastDonation) return { tone: 'neutral' as const, label: 'তথ্য নেই', note: 'শেষ রক্তদানের তারিখ জানা নেই' };
  const days = daysSince(lastDonation, now);
  if (days >= DONATION_GAP_DAYS) return { tone: 'success' as const, label: 'রক্ত দিতে প্রস্তুত', note: `${bn(days)} দিন পেরিয়েছে` };
  return { tone: 'warning' as const, label: 'এখনো নয়', note: `আরও ${bn(DONATION_GAP_DAYS - days)} দিন বাকি` };
}

export function DonorCard({ donor }: { donor: Donor }) {
  const now = useNow() ?? new Date(0);
  const st = donorStatus(donor.lastDonation, now);
  const [open, setOpen] = useState(false);

  return (
    <article className="bb-card bb-donor">
      <div className="bb-donor-group" aria-label={`রক্তের গ্রুপ ${donor.group}`}>
        <Icon name="drop" size={16} />
        <span>{donor.group}</span>
      </div>
      <div className="bb-donor-body">
        <h3 className="bb-card-title">{donor.name}</h3>
        <MetaList items={[donor.address && { icon: 'pin', text: donor.address }, { icon: 'calendar', text: donor.lastDonation ? `শেষ রক্তদান ${formatDate(donor.lastDonation)}` : 'শেষ রক্তদান: তথ্য নেই' }]} />
        <div className="bb-donor-status">
          <Badge tone={st.tone} dot>
            {st.label}
          </Badge>
          <span>{st.note}</span>
        </div>
      </div>
      <div className="bb-donor-actions">
        <Button variant={st.tone === 'success' ? 'emergency' : 'secondary'} iconLeft="phone" href={telHref(donor.phone)} size="sm">
          কল করুন
        </Button>
        <button type="button" className="bb-linkbtn" onClick={() => setOpen(true)}>
          তারিখ হালনাগাদ
        </button>
      </div>
      <UpdateDonationDialog donor={donor} open={open} onOpenChange={setOpen} />
    </article>
  );
}

function UpdateDonationDialog({ donor, open, onOpenChange }: { donor: Donor; open: boolean; onOpenChange: (o: boolean) => void }) {
  const update = useUpdateLastDonation();
  const form = useForm<UpdateDonationIn, unknown, UpdateDonationInput>({ resolver: zodResolver(updateDonationSchema), defaultValues: { phone: '', lastDonation: '' } });
  const { errors } = form.formState;
  const submit = form.handleSubmit((v) =>
    update.mutate(
      { id: donor.id, ...v },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
        onError: (e) => applyApiErrors(form, e),
      },
    ),
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange} icon="calendar" title="শেষ রক্তদানের তারিখ" description={`${donor.name} — নিবন্ধিত মোবাইল নম্বর দিয়ে নিশ্চিত করুন।`}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <TextField label="নিবন্ধিত মোবাইল নম্বর" required inputMode="tel" icon="phone" {...form.register('phone')} error={errors.phone?.message} />
        <TextField label="শেষ রক্তদানের তারিখ" required type="date" {...form.register('lastDonation')} error={errors.lastDonation?.message} />
        {errors.root && <Alert tone="danger" title={errors.root.message} />}
        <Button type="submit" block loading={update.isPending} iconLeft="check">
          হালনাগাদ করুন
        </Button>
      </form>
    </Dialog>
  );
}
