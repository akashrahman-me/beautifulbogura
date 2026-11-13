import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Misc';

/** Shown after an anonymous post is published: where to see it and a PIN reminder. */
export function PostedSuccess({ title, href, listLabel, days }: { title: string; href: string; listLabel: string; days?: string }) {
  return (
    <Alert
      tone="success"
      title={title}
      action={
        <Button href={href} size="sm" variant="secondary" iconRight="arrow-right">
          {listLabel}
        </Button>
      }
    >
      <p>{days ? `পোস্টটি ${days} দেখা যাবে, তারপর নিজে থেকেই সরে যাবে। ` : ''}আপনার পিনটি মনে রাখুন — পোস্ট মুছে ফেলতে বা ‘সম্পন্ন’ করতে লাগবে।</p>
    </Alert>
  );
}
