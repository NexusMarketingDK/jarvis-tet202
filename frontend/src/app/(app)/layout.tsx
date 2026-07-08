import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
