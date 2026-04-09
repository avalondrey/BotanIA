/**
 * Ollama Client — BotanIA Agent
 * Handles chat (qwen2.5:7b) and embeddings (nomic-embed-text)
 */

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:7b';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // base64 encoded images
}

export interface OllamaChatOptions {
  temperature?: number;
  numPredict?: number;
  topK?: number;
  topP?: number;
  repeatPenalty?: number;
  stop?: string[];
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  totalDuration?: number;
  evalCount?: number;
}

export interface OllamaEmbeddingResponse {
  embedding: number[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Send a chat message to Ollama with full context
 */
export async function chat(
  messages: OllamaMessage[],
  options: OllamaChatOptions = {}
): Promise<OllamaChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 2min timeout

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.3,
          num_predict: options.numPredict ?? 800,
          top_k: options.topK,
          top_p: options.topP,
          repeat_penalty: options.repeatPenalty,
          stop: options.stop,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama chat failed: ${response.status} — ${error}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Simple one-shot chat with system prompt + user message
 */
export async function simpleChat(
  systemPrompt: string,
  userMessage: string,
  contextPrompt?: string,
  options: OllamaChatOptions = {}
): Promise<string> {
  const messages: OllamaMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (contextPrompt) {
    messages.push({
      role: 'system',
      content: `=== CONTEXTE BOTANIA ===\n${contextPrompt}\n=== FIN CONTEXTE ===`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await chat(messages, options);
  return response.message.content;
}

// ─── Embeddings ────────────────────────────────────────────────────────────────

/**
 * Generate embedding for a text using Ollama
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data: OllamaEmbeddingResponse = await response.json();
    return data.embedding;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ─── Health & Model Info ───────────────────────────────────────────────────────

/**
 * Check if Ollama is reachable and list available models
 */
export async function getOllamaStatus(): Promise<{
  available: boolean;
  models: string[];
  defaultModel: string;
}> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { available: false, models: [], defaultModel: CHAT_MODEL };
    }

    const data = await response.json();
    const models = (data.models || []).map((m: { name: string }) => m.name);

    return { available: true, models, defaultModel: CHAT_MODEL };
  } catch {
    return { available: false, models: [], defaultModel: CHAT_MODEL };
  }
}

/**
 * Check if a specific model is available
 */
export async function isModelAvailable(modelName: string): Promise<boolean> {
  const status = await getOllamaStatus();
  return status.models.includes(modelName);
}

// ─── Stream Chat (for real-time UI) ──────────────────────────────────────────

export interface StreamChunk {
  message: OllamaMessage;
  done: boolean;
}

/**
 * Stream chat responses (for typing effect in UI)
 */
export async function* streamChat(
  messages: OllamaMessage[],
  options: OllamaChatOptions = {}
): AsyncGenerator<StreamChunk, void, unknown> {
  const controller = new AbortController();

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.3,
        num_predict: options.numPredict ?? 800,
      },
    }),
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama stream failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk: OllamaChatResponse = JSON.parse(line);
          yield {
            message: chunk.message,
            done: chunk.done,
          };
          if (chunk.done) return;
        } catch {
          // skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
    controller.abort();
  }
}
