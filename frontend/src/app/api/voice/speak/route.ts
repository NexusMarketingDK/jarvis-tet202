import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // ElevenLabs "Adam"

const requestSchema = z.object({
  text: z.string().min(1).max(5_000),
});

/**
 * POST /api/voice/speak – text-to-speech via ElevenLabs. Returns audio/mpeg.
 * Returns 501 when ELEVENLABS_API_KEY is not configured.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ElevenLabs er ikke konfigureret (ELEVENLABS_API_KEY mangler)' },
      { status: 501 },
    );
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: voiceSettings } = await supabase
    .from('voice_settings')
    .select('elevenlabs_voice_id')
    .single();
  const voiceId = voiceSettings?.elevenlabs_voice_id || DEFAULT_VOICE_ID;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: parsed.data.text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!response.ok) {
    return Response.json({ error: 'Text-to-speech failed' }, { status: 502 });
  }

  return new Response(response.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
