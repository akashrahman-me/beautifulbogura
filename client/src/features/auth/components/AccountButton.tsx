'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconButton } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Misc';
import { useSession } from '../hooks/useAuth';
import { SignInDialog } from './SignInDialog';

/** Header slot: the user's avatar (→ account) once signed in, otherwise a sign-in button. */
export function AccountButton() {
  const user = useSession();
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <Link href="/account" className="bb-iconbtn bb-iconbtn-ghost bb-iconbtn-md" aria-label={`আমার অ্যাকাউন্ট — ${user.name}`} title="আমার অ্যাকাউন্ট">
        <Avatar name={user.name} src={user.avatar} size="sm" />
      </Link>
    );
  }
  return (
    <>
      <IconButton icon="user" label="সাইন ইন" onClick={() => setOpen(true)} />
      <SignInDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
