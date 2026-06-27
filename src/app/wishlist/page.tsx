import { redirect } from 'next/navigation';

export default function WishlistPage() {
  redirect('/archive?tab=personal');
}
