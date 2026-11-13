'use client';

import { useState } from 'react';
import type { PinAction, ReportInput } from '@/types/api';
import { Icon } from '@/components/ui/Icon';
import { PinManageDialog, ReportDialog } from './PostDialogs';

type Mut<B> = {
  mutate: (body: B, opts: { onSuccess: () => void; onError?: (e: Error) => void }) => void;
  isPending: boolean;
};

/** “রিপোর্ট” and “পিন দিয়ে সম্পাদনা” row at the foot of every community post. */
export function PostActions({ id, manage, report, doneLabel }: { id: string; manage: Mut<PinAction & { id: string }>; report: Mut<ReportInput & { id: string }>; doneLabel?: string }) {
  const [pinOpen, setPinOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <>
      <div className="bb-listing-tools">
        <button type="button" className="bb-linkbtn bb-linkbtn-muted" onClick={() => setReportOpen(true)}>
          <Icon name="flag" size={16} />
          রিপোর্ট
        </button>
        <button type="button" className="bb-linkbtn bb-linkbtn-muted" onClick={() => setPinOpen(true)}>
          <Icon name="lock" size={16} />
          পিন দিয়ে পরিচালনা
        </button>
      </div>
      <PinManageDialog open={pinOpen} onOpenChange={setPinOpen} doneLabel={doneLabel} pending={manage.isPending} onSubmit={(body, opts) => manage.mutate({ id, ...body }, opts)} />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} pending={report.isPending} onSubmit={(body, opts) => report.mutate({ id, ...body }, opts)} />
    </>
  );
}
