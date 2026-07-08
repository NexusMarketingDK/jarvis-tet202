import Anthropic from '@anthropic-ai/sdk';
import { parseAction, type ChatStreamEvent, type Memory } from '@jarvis/shared';
import { actionRequiresConfirmation, dispatchAction } from '@/lib/server/actions/dispatch';
import { buildSystemPrompt } from './system-prompt';
import { jarvisTools } from './tools';

const MODEL = 'claude-sonnet-4-5';
const MAX_TOOL_ROUNDS = 4;
const MAX_OUTPUT_TOKENS = 2048;

export interface ChatTurnParams {
  userId: string;
  deviceId: string | null;
  language: string;
  memories: Memory[];
  history: Anthropic.MessageParam[];
  saveMemory: (memory: {
    category: string;
    key: string;
    value: string;
    importance?: number;
  }) => Promise<void>;
  onEvent: (event: ChatStreamEvent) => void;
}

/**
 * Runs one Jarvis chat turn as an agentic loop:
 * stream text -> handle tool calls (memory / device actions) -> feed tool
 * results back -> repeat until Claude ends the turn.
 *
 * Returns the full assistant text so the caller can persist it.
 */
export async function runChatTurn(params: ChatTurnParams): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const system = buildSystemPrompt({ memories: params.memories, language: params.language });

  const messages: Anthropic.MessageParam[] = [...params.history];
  let assistantText = '';

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system,
      tools: jarvisTools,
      messages,
    });

    stream.on('text', (delta) => {
      assistantText += delta;
      params.onEvent({ type: 'text_delta', text: delta });
    });

    const finalMessage = await stream.finalMessage();
    const toolUses = finalMessage.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    if (finalMessage.stop_reason !== 'tool_use' || toolUses.length === 0) {
      break;
    }

    messages.push({ role: 'assistant', content: finalMessage.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: await handleToolUse(toolUse, params),
      });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return assistantText;
}

async function handleToolUse(
  toolUse: { name: string; input: unknown },
  params: ChatTurnParams,
): Promise<string> {
  if (toolUse.name === 'save_memory') {
    const input = toolUse.input as { category: string; key: string; value: string; importance?: number };
    await params.saveMemory(input);
    return 'Memory saved.';
  }

  if (toolUse.name === 'execute_device_action') {
    const action = parseAction(toolUse.input);
    if (!action) {
      return 'Rejected: the action is not in the whitelist or the payload is invalid.';
    }
    if (!params.deviceId) {
      return 'No local agent is online. Ask the user to start the Jarvis agent on their PC.';
    }
    if (actionRequiresConfirmation(action)) {
      params.onEvent({
        type: 'action',
        requestId: crypto.randomUUID(),
        action,
        requiresConfirmation: true,
      });
      return 'This action requires user confirmation. A confirmation card was shown; tell the user to confirm it there.';
    }
    const result = await dispatchAction({
      userId: params.userId,
      deviceId: params.deviceId,
      action,
    });
    if (!result.ok) {
      return `Dispatch failed: ${result.error}`;
    }
    params.onEvent({
      type: 'action',
      requestId: result.requestId!,
      action,
      requiresConfirmation: false,
    });
    return 'Action dispatched to the local agent.';
  }

  return `Unknown tool: ${toolUse.name}`;
}
