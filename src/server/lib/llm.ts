import { env } from "cloudflare:workers";

/**
 * Minimal client for any OpenAI-compatible Chat Completions API
 * (OpenAI, OpenRouter, Groq, Together, Ollama, Gemini's OpenAI endpoint...).
 *
 * Configure with:
 * - LLM_API_KEY  (required to enable AI features)
 * - LLM_BASE_URL (defaults to https://api.openai.com/v1)
 * - LLM_MODEL    (defaults to gpt-4o-mini)
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type ChatCompletionResponse = {
  choices?: { message?: { content?: string | null } }[];
};

export function isLlmConfigured(): boolean {
  return Boolean(env.LLM_API_KEY?.trim());
}

export async function runChatCompletion(
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = env.LLM_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }

  const baseUrl = (env.LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const model = env.LLM_MODEL?.trim() || DEFAULT_MODEL;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM API ${response.status}: ${text.slice(0, 300)}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
