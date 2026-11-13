'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, Rating } from '@/components/ui/Interactive';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { ContactActions, PhoneLink } from '@/components/shared/Blocks';
import { useRateEntry } from '../hooks/useDirectory';
import type { DirectoryEntry, DirectoryType } from '../schemas/directory.schema';

/** The universal directory entry: officer, office, lawyer, bank, parlour… Number printed in full next to the call buttons. */
export function DirectoryCard({ entry, config }: { entry: DirectoryEntry; config: DirectoryType }) {
  const [rateOpen, setRateOpen] = useState(false);
  const rate = useRateEntry(entry.type);

  return (
    <article className="bb-card bb-dcard">
      <div className="bb-dcard-head">
        <Avatar name={entry.name} src={entry.photo} icon={entry.photo ? undefined : config.icon} tone={config.tone} square={!config.countLabel?.includes('জন')} />
        <div className="bb-dcard-id">
          {entry.verified && (
            <div className="bb-badges">
              <Badge tone="verified">যাচাইকৃত</Badge>
            </div>
          )}
          <h3 className="bb-card-title">{entry.name}</h3>
          {entry.role && <p className="bb-dcard-role">{entry.role}</p>}
        </div>
      </div>

      {config.ratable && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Rating value={entry.rating ?? 0} count={entry.ratingCount ?? 0} />
          <Button variant="link" onClick={() => setRateOpen(true)}>
            রেটিং দিন
          </Button>
        </div>
      )}

      <MetaList
        items={[
          entry.address && { icon: 'pin', text: entry.address },
          entry.hours && { icon: 'clock', text: entry.hours },
        ]}
      />
      {entry.description && <p className="bb-card-text">{entry.description}</p>}
      {entry.mapUrl && (
        <a className="bb-linkbtn self-start" href={entry.mapUrl} target="_blank" rel="noopener noreferrer">
          ম্যাপে দেখুন
        </a>
      )}

      {entry.phone && (
        <div className="bb-dcard-foot">
          <PhoneLink phone={entry.phone} />
          <ContactActions phone={entry.phone} whatsapp={entry.whatsapp} copy compact tone={config.emergency ? 'emergency' : undefined} />
        </div>
      )}

      {config.ratable && (
        <Dialog open={rateOpen} onOpenChange={setRateOpen} icon="star" title={`${entry.name} — রেটিং দিন`}>
          <div className="flex justify-center py-2">
            <Rating interactive size={32} value={0} onRate={(stars) => rate.mutate({ id: entry.id, stars }, { onSuccess: () => setRateOpen(false) })} />
          </div>
        </Dialog>
      )}
    </article>
  );
}
