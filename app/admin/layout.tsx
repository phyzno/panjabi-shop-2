export const dynamic = 'force-dynamic';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // এখানে কোনো সাইডবার থাকবে না, যাতে লগ-ইন পেজ পুরো স্ক্রিন পায়
  return <>{children}</>;
}