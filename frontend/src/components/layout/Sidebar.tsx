'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  Brain,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Monitor,
  Settings,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/memory', label: 'Hukommelse', icon: Brain },
  { href: '/devices', label: 'Enheder', icon: Monitor },
  { href: '/activity', label: 'Aktivitet', icon: Activity },
  { href: '/settings', label: 'Indstillinger', icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="glass sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-arc/40 bg-arc-soft">
          <span className="text-sm font-semibold text-arc">J</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">Jarvis</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-arc-soft text-arc'
                  : 'text-slate-400 hover:bg-surface-raised hover:text-slate-200'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="truncate text-xs text-slate-500">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-slate-400 transition hover:text-red-400"
        >
          <LogOut size={15} />
          Log ud
        </button>
      </div>
    </aside>
  );
}
