import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/States';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <EmptyState icon="map" title="পাতাটি খুঁজে পাওয়া যায়নি" action={<Button href="/">ড্যাশবোর্ডে যান</Button>} />
    </main>
  );
}
