'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Field';
import { ChoiceGroup, Dialog } from '@/components/ui/Interactive';
import type { IconName } from '@/components/ui/Icon';
import type { ReasonInput } from '@/types/api';

/** Yes / no before something consequential. `tone="emergency"` for destructive actions only. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  tone,
  icon = 'alert',
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  tone?: 'emergency';
  icon?: IconName;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={icon}
      tone={tone}
      title={title}
      description={description}
      actions={
        <>
          <Button variant={tone === 'emergency' ? 'emergency' : 'primary'} block loading={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" block onClick={() => onOpenChange(false)}>
            বাতিল
          </Button>
        </>
      }
    />
  );
}

/**
 * Ask why before rejecting, removing or banning. Common reasons are chips; “অন্যান্য” opens a note.
 * The reason is stored in the audit log and, where relevant, shown to the affected person.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasons,
  confirmLabel,
  onSubmit,
  pending,
  tone = 'emergency',
  icon = 'alert',
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  reasons: string[];
  confirmLabel: string;
  onSubmit: (input: ReasonInput) => void;
  pending?: boolean;
  tone?: 'emergency';
  icon?: IconName;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const other = reason === 'অন্যান্য';
  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setReason('');
      setNote('');
    }
  };
  const ready = reason && (!other || note.trim().length >= 3);
  return (
    <Dialog
      open={open}
      onOpenChange={close}
      icon={icon}
      tone={tone}
      title={title}
      description={description}
      actions={
        <>
          <Button variant={tone === 'emergency' ? 'emergency' : 'primary'} block disabled={!ready} loading={pending} onClick={() => onSubmit({ reason: other ? note.trim() : reason, note: !other && note.trim() ? note.trim() : undefined })}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" block onClick={() => close(false)}>
            বাতিল
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ChoiceGroup label="কারণ" required options={[...reasons, 'অন্যান্য'].map((r) => ({ value: r, label: r }))} value={reason} onChange={setReason} />
        <TextArea label={other ? 'কারণ লিখুন' : 'অতিরিক্ত নোট'} required={other} optional={!other} rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Dialog>
  );
}
