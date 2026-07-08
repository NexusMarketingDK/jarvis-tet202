'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { UiMessage } from '@/hooks/useChat';
import { ActionCard } from './ActionCard';

export function ChatMessageItem({ message }: { message: UiMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'bg-arc-soft text-slate-100' : 'glass text-slate-200'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-jarvis">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content || (message.streaming ? '…' : '')}
            </ReactMarkdown>
          </div>
        )}
        {message.action && (
          <ActionCard
            action={message.action.action}
            requiresConfirmation={message.action.requiresConfirmation}
          />
        )}
      </div>
    </div>
  );
}
