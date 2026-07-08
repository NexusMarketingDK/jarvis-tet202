import type { JarvisAction } from '../actions/schemas';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatSummary {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  /** Present when the assistant proposed a device action in this message. */
  action?: JarvisAction | null;
  createdAt: string;
}

/** Server-sent events streamed from POST /api/chat. */
export type ChatStreamEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'action'; requestId: string; action: JarvisAction; requiresConfirmation: boolean }
  | { type: 'done'; messageId: string }
  | { type: 'error'; message: string };
