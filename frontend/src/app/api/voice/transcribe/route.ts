import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/voice/transcribe – speech-to-text via OpenAI Whisper.
 * Expects multipart/form-data with an `audio` file. Returns { text }.
 * Returns 501 when OPENAI_API_KEY is not configured.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Whisper er ikke konfigureret (OPENAI_API_KEY mangler)' }, {
      status: 501,
    });
  }

  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!(audio instanceof Blob)) {
    return Response.json({ error: 'Missing audio file' }, { status: 400 });
  }

  const whisperForm = new FormData();
  whisperForm.append('file', audio, 'audio.webm');
  whisperForm.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  });

  if (!response.ok) {
    return Response.json({ error: 'Transcription failed' }, { status: 502 });
  }

  const result = (await response.json()) as { text: string };
  return Response.json({ text: result.text });
}
