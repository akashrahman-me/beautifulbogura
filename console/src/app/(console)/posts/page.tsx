import type { Metadata } from 'next';
import { PostsPage } from '@/features/posts';

export const metadata: Metadata = { title: 'পোস্ট' };

export default function Page() {
  return <PostsPage />;
}
