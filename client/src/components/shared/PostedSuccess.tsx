import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Misc';

/** Shown after a community post is published: where to see it, and where to manage it later. */
export function PostedSuccess({ title, href, listLabel, days }: { title: string; href: string; listLabel: string; days?: string }) {
  return (
    <Alert
      tone="success"
      title={title}
      action={
        <div className="flex flex-wrap gap-2">
          <Button href={href} size="sm" variant="secondary" iconRight="arrow-right">
            {listLabel}
          </Button>
          <Button href="/account" size="sm" variant="ghost" iconLeft="user">
            আমার পোস্ট
          </Button>
        </div>
      }
    >
      {days && (
        <p className="flex items-center gap-1.5">
          <Icon name="clock" size={16} />
          {days} দেখা যাবে, তারপর নিজে থেকেই সরে যাবে।
        </p>
      )}
    </Alert>
  );
}
