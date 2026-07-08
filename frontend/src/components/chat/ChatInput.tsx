'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { VoiceOrb } from '@/components/ui/VoiceOrb';

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (content: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState('');
  const { recording, error: voiceError, toggle } = useVoiceInput((text) => onSend(text));

  function submit() {
    const content = value.trim();
    if (!content || disabled) return;
    setValue('');
    onSend(content);
  }

  return (
    <div className="border-t border-line p-4">
      {voiceError && <p className="mb-2 text-xs text-amber-400">{voiceError}</p>}
      <div className="glass flex items-end gap-2 rounded-2xl p-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Skriv til Jarvis…  (Enter for at sende)"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-500"
        />
        <VoiceOrb active={recording} onClick={toggle} />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-arc/90 text-slate-950 transition hover:bg-arc disabled:opacity-40"
        >
          <SendHorizonal size={17} />
        </button>
      </div>
    </div>
  );
}
