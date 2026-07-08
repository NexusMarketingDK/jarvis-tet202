import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /chat/new – creates a fresh chat and redirects to it. */
export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: chat } = await supabase
    .from('chats')
    .insert({ user_id: user.id })
    .select('id')
    .single();

  return NextResponse.redirect(new URL(`/chat/${chat!.id}`, request.url));
}
