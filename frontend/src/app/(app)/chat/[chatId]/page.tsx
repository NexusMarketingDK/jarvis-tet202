import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { JarvisAction } from '@jarvis/shared';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { UiMessage } from '@/hooks/useChat';
import { createClient } from '@/lib/supabase/server';

export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const supabase = createClient();

  const [{ data: chat }, { data: chats }, { data: messages }] = await Promise.all([
    supabase.from('chats').select('id, title').eq('id', params.chatId).maybeSingle(),
    supabase
      .from('chats')
      .select('id, title, pinned')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(20),
    supabase
      .from('messages')
      .select('id, role, content, action')
      .eq('chat_id', params.chatId)
      .order('created_at', { ascending: true })
      .limit(100),
  ]);

  if (!chat) {
    notFound();
  }

  // DB columns are text/jsonb; narrow to the shared domain types at this boundary.
  const initialMessages: UiMessage[] = (messages ?? [])
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      action: m.action
        ? { action: m.action as unknown as JarvisAction, requiresConfirmation: false }
        : null,
    }));

  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line p-4 lg:flex">
        <NewChatButton />
        <div className="mt-4 space-y-1 overflow-y-auto">
          {(chats ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className={`block truncate rounded-lg px-3 py-2 text-sm transition ${
                c.id === chat.id
                  ? 'bg-arc-soft text-arc'
                  : 'text-slate-400 hover:bg-surface-raised hover:text-slate-200'
              }`}
            >
              {c.pinned ? '📌 ' : ''}
              {c.title}
            </Link>
          ))}
        </div>
      </aside>
      <div className="flex-1">
        <ChatWindow chatId={chat.id} initialMessages={initialMessages} />
      </div>
    </div>
  );
}

function NewChatButton() {
  return (
    <Link
      href="/chat/new"
      className="flex items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-slate-300 transition hover:border-arc/50 hover:text-arc"
    >
      <Plus size={15} />
      Ny samtale
    </Link>
  );
}
