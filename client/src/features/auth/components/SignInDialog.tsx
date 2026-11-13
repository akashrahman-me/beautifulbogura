'use client';

import { Dialog } from '@/components/ui/Interactive';
import { SignInOptions } from './SignInOptions';

export function SignInDialog({
  open,
  onOpenChange,
  title = 'সাইন ইন করুন',
  description = 'Google, Facebook বা Apple অ্যাকাউন্ট দিয়ে এক ক্লিকে।',
  returnTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  returnTo?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} icon="user" title={title} description={description}>
      <SignInOptions returnTo={returnTo} onSignedIn={() => onOpenChange(false)} />
    </Dialog>
  );
}
