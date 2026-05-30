import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminRootPage() {
  // পুরনো পেজ বাদ দিয়ে সরাসরি নতুন Orders পেজে রিডাইরেক্ট
  redirect('/admin/orders');
}