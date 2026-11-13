import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/States';

export default function NotFound() {
  return (
    <div className="container-narrow pt-10">
      <EmptyState icon="map" title="পাতাটি খুঁজে পাওয়া যায়নি" action={<Button href="/">হোমে ফিরে যান</Button>}>
        লিংকটি ভুল হতে পারে, অথবা পাতাটি সরিয়ে নেওয়া হয়েছে।
      </EmptyState>
    </div>
  );
}
