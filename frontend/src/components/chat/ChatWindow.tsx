'use client';

import { useEffect, useRef } from 'react';
import { useChat, type UiMessage } from '@/hooks/useChat';
import { ChatInput } from './ChatInput';
import { ChatMessageItem } from './ChatMessageItem';

export function ChatWindow({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: UiMessage[];
}) {
  const { messages, sendMessage, busy } = useChat(chatId, initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-arc/40 bg-arc-soft animate-pulseGlow">
              <span className="text-xl font-semibold text-arc">J</span>
            </div>
            <p className="text-slate-400">Til tjeneste. Hvad kan jeg gøre for dig?</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={busy} />
    </div>
  );
}
