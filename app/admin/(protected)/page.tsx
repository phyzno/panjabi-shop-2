import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin',
};

export default function AdminRootPage() {
  redirect('/admin/orders');
}
