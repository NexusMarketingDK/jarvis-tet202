'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Records microphone audio and transcribes it via /api/voice/transcribe
 * (Whisper). Wake-word detection is a V1.1 concern; this hook covers
 * push-to-talk.
 */
export function useVoiceInput(onTranscript: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('audio', blob);
        const response = await fetch('/api/voice/transcribe', { method: 'POST', body: form });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(body?.error ?? 'Transskription fejlede');
          return;
        }
        const { text } = (await response.json()) as { text: string };
        if (text.trim()) onTranscript(text.trim());
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Kunne ikke få adgang til mikrofonen');
    }
  }, [onTranscript]);

  const toggle = useCallback(() => (recording ? stop() : start()), [recording, start, stop]);

  return { recording, error, toggle };
}
