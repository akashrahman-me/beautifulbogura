import Link from 'next/link';
import { money, WEEKDAYS_SHORT } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Avatar, MetaList } from '@/components/ui/Misc';
import { PhoneLink } from '@/components/shared/Blocks';
import { telHref } from '@/lib/utils';
import type { Chamber, Doctor } from '../schemas/doctor.schema';

export const chamberDays = (c: Chamber) => {
  const order = [6, 0, 1, 2, 3, 4, 5]; // Saturday-first week, as people say it here
  const sorted = order.filter((d) => c.days.includes(d));
  return sorted.length === 7 ? 'প্রতিদিন' : sorted.map((d) => WEEKDAYS_SHORT[d]).join(', ');
};

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const ch = doctor.chambers[0];
  return (
    <article className="bb-card bb-dcard bb-doctor">
      <div className="bb-dcard-head">
        <Avatar name={doctor.name} src={doctor.photo} tone="brand" />
        <div className="bb-dcard-id">
          <div className="bb-badges">
            <Badge tone="brand" icon="stethoscope">
              {doctor.specialty}
            </Badge>
            {doctor.sittingToday && (
              <Badge tone="success" dot>
                আজ বসছেন
              </Badge>
            )}
          </div>
          <h3 className="bb-card-title">
            <Link href={`/doctors/${doctor.id}`}>{doctor.name}</Link>
          </h3>
          <p className="bb-doctor-deg">{doctor.degrees.join(', ')}</p>
        </div>
      </div>
      {ch && (
        <MetaList
          items={[
            { icon: 'hospital', text: ch.hospital },
            { icon: 'calendar', text: chamberDays(ch) },
            { icon: 'clock', text: ch.time },
          ]}
        />
      )}
      {ch?.fee != null && (
        <p className="bb-doctor-fee">
          ফি <strong>{money(ch.fee)}</strong>
        </p>
      )}
      <div className="bb-dcard-foot">
        <PhoneLink phone={ch?.serial ?? doctor.phone} />
        <div className="bb-row">
          <IconButton icon="phone" label="সিরিয়ালের জন্য কল করুন" variant="brand" href={telHref(ch?.serial ?? doctor.phone)} />
          <Button variant="secondary" size="sm" iconRight="chevron-right" href={`/doctors/${doctor.id}`}>
            আরও দেখুন
          </Button>
        </div>
      </div>
    </article>
  );
}
