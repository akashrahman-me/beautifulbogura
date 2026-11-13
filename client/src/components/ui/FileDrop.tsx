'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { bn, cn } from '@/lib/utils';
import { Field, type FieldBaseProps } from './Field';
import { Icon } from './Icon';

/** Photo upload by tap or drag-and-drop, with thumbnails. Holds File objects; the caller uploads them. */
export function FileDrop({
  value,
  onChange,
  max = 5,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 5,
  ...field
}: FieldBaseProps & { value: File[]; onChange: (files: File[]) => void; max?: number; accept?: string; maxSizeMb?: number }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);

  const previews = useMemo(() => value.map((f) => URL.createObjectURL(f)), [value]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = [...list].filter((f) => f.type.startsWith('image/'));
    const tooBig = incoming.filter((f) => f.size > maxSizeMb * 1024 * 1024);
    setRejected(tooBig.length ? `${bn(maxSizeMb)} এমবির বড় ছবি নেওয়া হয়নি` : null);
    onChange([...value, ...incoming.filter((f) => f.size <= maxSizeMb * 1024 * 1024)].slice(0, max));
  };

  return (
    <Field id={id} {...field} error={field.error ?? rejected}>
      <label
        htmlFor={id}
        className={cn('bb-drop', over && 'is-over')}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
      >
        <span className="bb-drop-icon">
          <Icon name="upload" size={24} />
        </span>
        <span className="bb-drop-title">
          ছবি টেনে এনে ছাড়ুন, অথবা <u>বেছে নিন</u>
        </span>
        <span className="bb-drop-meta">
          সর্বোচ্চ {bn(max)}টি ছবি · JPG, PNG বা WebP · প্রতিটি {bn(maxSizeMb)} এমবির কম
        </span>
        <input id={id} type="file" accept={accept} multiple={max > 1} className="bb-sr" onChange={(e) => add(e.target.files)} disabled={value.length >= max} />
      </label>
      {previews.length > 0 && (
        <ul className="bb-drop-files">
          {previews.map((src, i) => (
            <li key={src} className="bb-drop-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={src} alt="" />
              <button type="button" className="bb-drop-remove" aria-label="ছবি সরান" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}
