import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/** Opens the most recent chat, creating one if the user has none. */
export default async function ChatIndexPage() {
  const supabase = createClient();

  const { data: latest } = await supabase
    .from('chats')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest) {
    redirect(`/chat/${latest.id}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: created } = await supabase
    .from('chats')
    .insert({ user_id: user!.id })
    .select('id')
    .single();

  redirect(`/chat/${created!.id}`);
}
