import { z } from 'zod';
import { dispatchAction } from '@/lib/server/actions/dispatch';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const requestSchema = z.object({
  deviceId: z.string().uuid(),
  action: z.unknown(),
});

/**
 * POST /api/actions – dispatches a device action manually (e.g. when the
 * user confirms a high-risk action card in the chat UI).
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

  const result = await dispatchAction({
    userId: user.id,
    deviceId: parsed.data.deviceId,
    action: parsed.data.action,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ requestId: result.requestId });
}
