'use client';

import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Misc';

/** Shows only when the browser supports notifications and they are not yet allowed. */
export function NotificationPrompt() {
  const initial = useSyncExternalStore(
    () => () => {},
    () => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission),
    () => null,
  );
  const [asked, setPerm] = useState<NotificationPermission | null>(null);
  const perm = asked ?? initial;

  if (perm === null || perm === 'granted' || perm === 'unsupported') return null;

  if (perm === 'denied') {
    return (
      <Alert tone="info" icon="bell-off" title="নোটিফিকেশন বন্ধ আছে">
        ব্রাউজারের সাইট সেটিংস থেকে এই সাইটের নোটিফিকেশন চালু করুন।
      </Alert>
    );
  }
  return (
    <Alert
      tone="info"
      icon="bell"
      title="জরুরি খবর ও রক্তের অনুরোধ জানতে চান?"
      action={
        <Button size="sm" variant="secondary" iconLeft="bell" onClick={() => Notification.requestPermission().then(setPerm)}>
          চালু করুন
        </Button>
      }
    />
  );
}
