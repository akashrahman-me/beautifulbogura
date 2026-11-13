'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api-client';
import type { PinAction, ReportInput } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { ChoiceGroup, Dialog } from '@/components/ui/Interactive';
import { TextArea } from '@/components/ui/Field';
import { PinInput } from '@/components/ui/PinInput';

/**
 * Unlock an anonymous post with its PIN: mark done (rented / sold) or delete.
 * Delete asks a second time before it happens.
 */
export function PinManageDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
  doneLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: PinAction, opts: { onSuccess: () => void; onError: (e: Error) => void }) => void;
  pending: boolean;
  /** e.g. “ভাড়া হয়ে গেছে”; omit when a post has no done state. */
  doneLabel?: string;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setPin('');
      setError(null);
      setConfirmDelete(false);
    }
  };
  const run = (action: PinAction['action']) =>
    onSubmit(
      { pin, action },
      {
        onSuccess: () => close(false),
        onError: (e) => {
          setConfirmDelete(false);
          setError(e instanceof ApiError && e.code === 'INVALID_PIN' ? 'পিন মেলেনি। আবার চেষ্টা করুন।' : e.message);
        },
      },
    );
  const ready = pin.length >= 4;

  return (
    <Dialog
      open={open}
      onOpenChange={close}
      icon={confirmDelete ? 'trash' : 'lock'}
      tone={confirmDelete ? 'emergency' : undefined}
      title={confirmDelete ? 'পোস্টটি মুছে ফেলবেন?' : 'পিন দিয়ে পোস্ট পরিচালনা'}
      description={confirmDelete ? 'মুছে ফেলা পোস্ট আর ফিরিয়ে আনা যাবে না।' : 'পোস্ট দেওয়ার সময় যে পিন দিয়েছিলেন, সেটি লিখুন।'}
      actions={
        confirmDelete ? (
          <>
            <Button variant="emergency" iconLeft="trash" block loading={pending} onClick={() => run('delete')}>
              হ্যাঁ, মুছে ফেলুন
            </Button>
            <Button variant="ghost" block onClick={() => setConfirmDelete(false)}>
              বাতিল
            </Button>
          </>
        ) : (
          <>
            {doneLabel && (
              <Button variant="primary" iconLeft="check" block disabled={!ready} loading={pending} onClick={() => run('mark-done')}>
                {doneLabel}
              </Button>
            )}
            <Button variant="danger-ghost" iconLeft="trash" block disabled={!ready || pending} onClick={() => setConfirmDelete(true)}>
              মুছে ফেলুন
            </Button>
          </>
        )
      }
    >
      {!confirmDelete && (
        <PinInput
          label="আপনার পিন"
          length={4}
          mask
          value={pin}
          onChange={(v) => {
            setPin(v);
            setError(null);
          }}
          error={error}
          hint="পিন ভুলে গেলে অ্যাডমিনের সাথে যোগাযোগ করুন।"
        />
      )}
    </Dialog>
  );
}

const REASONS: { value: ReportInput['reason']; label: string }[] = [
  { value: 'fake', label: 'ভুয়া বা প্রতারণা' },
  { value: 'sold', label: 'ইতিমধ্যে বিক্রি/ভাড়া হয়েছে' },
  { value: 'wrong-info', label: 'ভুল তথ্য বা ছবি' },
  { value: 'other', label: 'অন্যান্য' },
];

export function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: ReportInput, opts: { onSuccess: () => void }) => void;
  pending: boolean;
}) {
  const [reason, setReason] = useState<ReportInput['reason'] | ''>('');
  const [note, setNote] = useState('');
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon="flag"
      tone="emergency"
      title="পোস্টটি রিপোর্ট করুন"
      description="কেন রিপোর্ট করছেন? অ্যাডমিন দেখে ব্যবস্থা নেবেন।"
      actions={
        <>
          <Button
            variant="emergency"
            block
            disabled={!reason}
            loading={pending}
            onClick={() =>
              reason &&
              onSubmit(
                { reason, note: note || undefined },
                {
                  onSuccess: () => {
                    onOpenChange(false);
                    setReason('');
                    setNote('');
                  },
                },
              )
            }
          >
            রিপোর্ট পাঠান
          </Button>
          <Button variant="ghost" block onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ChoiceGroup options={REASONS} value={reason} onChange={setReason} label="কারণ" required />
        {reason === 'other' && <TextArea label="বিস্তারিত" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />}
      </div>
    </Dialog>
  );
}
