import type Anthropic from '@anthropic-ai/sdk';
import type { ChatStreamEvent, Memory } from '@jarvis/shared';
import { z } from 'zod';
import { runChatTurn } from '@/lib/server/ai/chat-service';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const requestSchema = z.object({
  chatId: z.string().uuid(),
  message: z.string().min(1).max(20_000),
});

const HISTORY_LIMIT = 30;
const MEMORY_LIMIT = 50;

/**
 * POST /api/chat – runs one Jarvis turn and streams ChatStreamEvent
 * objects back as server-sent events (one JSON object per `data:` line).
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { chatId, message } = parsed.data;

  // RLS guarantees the chat belongs to this user.
  const { data: chat } = await supabase.from('chats').select('id').eq('id', chatId).single();
  if (!chat) {
    return Response.json({ error: 'Chat not found' }, { status: 404 });
  }

  const [{ data: rows }, { data: memoryRows }, { data: settings }, { data: device }] =
    await Promise.all([
      supabase
        .from('messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(HISTORY_LIMIT),
      supabase
        .from('memories')
        .select('*')
        .order('importance', { ascending: false })
        .limit(MEMORY_LIMIT),
      supabase.from('settings').select('language').single(),
      supabase
        .from('devices')
        .select('id')
        .eq('status', 'online')
        .order('last_seen_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  await supabase.from('messages').insert({
    chat_id: chatId,
    user_id: user.id,
    role: 'user',
    content: message,
  });

  const history: Anthropic.MessageParam[] = (rows ?? [])
    .reverse()
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  history.push({ role: 'user', content: message });

  const memories: Memory[] = (memoryRows ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    category: m.category as Memory['category'],
    key: m.key,
    value: m.value,
    importance: m.importance,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ChatStreamEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        const assistantText = await runChatTurn({
          userId: user.id,
          deviceId: device?.id ?? null,
          language: settings?.language ?? 'da',
          memories,
          history,
          saveMemory: async (memory) => {
            await supabase.from('memories').upsert(
              {
                user_id: user.id,
                category: memory.category,
                key: memory.key,
                value: memory.value,
                importance: memory.importance ?? 3,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,category,key' },
            );
          },
          onEvent: send,
        });

        const { data: saved } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            user_id: user.id,
            role: 'assistant',
            content: assistantText,
          })
          .select('id')
          .single();

        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);

        send({ type: 'done', messageId: saved?.id ?? '' });
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Ukendt fejl',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
