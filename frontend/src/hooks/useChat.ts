'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChatStreamEvent, JarvisAction } from '@jarvis/shared';

export interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: { action: JarvisAction; requiresConfirmation: boolean } | null;
  streaming?: boolean;
}

/**
 * Client-side chat state: sends a message to /api/chat and consumes the
 * SSE stream of ChatStreamEvent objects.
 */
export function useChat(chatId: string, initialMessages: UiMessage[]) {
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (busy || !content.trim()) return;
      setBusy(true);

      const userMessage: UiMessage = { id: crypto.randomUUID(), role: 'user', content };
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '', streaming: true },
      ]);

      const applyEvent = (event: ChatStreamEvent) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            switch (event.type) {
              case 'text_delta':
                return { ...m, content: m.content + event.text };
              case 'action':
                return {
                  ...m,
                  action: { action: event.action, requiresConfirmation: event.requiresConfirmation },
                };
              case 'error':
                return { ...m, content: m.content + `\n\n> ⚠️ ${event.message}`, streaming: false };
              case 'done':
                return { ...m, streaming: false };
            }
          }),
        );
      };

      try {
        abortRef.current = new AbortController();
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, message: content }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('Kunne ikke kontakte Jarvis');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            applyEvent(JSON.parse(line.slice(6)) as ChatStreamEvent);
          }
        }
      } catch (error) {
        applyEvent({
          type: 'error',
          message: error instanceof Error ? error.message : 'Ukendt fejl',
        });
      } finally {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
        );
        setBusy(false);
      }
    },
    [busy, chatId],
  );

  return { messages, sendMessage, busy };
}
