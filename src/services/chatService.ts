import { http } from "@/lib/http";

export type ChatRole = "user" | "assistant" | "system";
export type ChatMsg = { role: ChatRole; content: string };
export type BareCitation = { file: string; page: number; snippet?: string };

export type ChatResponse = {
  messageId: string;
  content: string;
  citations?: BareCitation[];
  usage?: { promptTokens: number; completionTokens: number; totalTokens?: number };
};

export async function sendChatNonStreaming(subjectId: string, messages: ChatMsg[]): Promise<ChatResponse> {
  return http<ChatResponse>(`/chat?subjectId=${encodeURIComponent(subjectId)}`, {
    method: "POST",
    body: JSON.stringify({ messages, options: { temperature: 0.2 } })
  });
}

export async function sendChatStreaming(
  subjectId: string,
  messages: ChatMsg[],
  onToken: (token: string) => void,
  onCitations?: (c: BareCitation[]) => void
): Promise<{ messageId?: string }> {
  const API_URL = import.meta.env.VITE_API_URL as string;
  const res = await fetch(`${API_URL}/chat/stream?subjectId=${encodeURIComponent(subjectId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ messages, options: { temperature: 0.2 } })
  });
  if (!res.ok || !res.body) throw new Error(`SSE failed: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let messageId: string | undefined;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const json = t.slice(5).trim();
      if (!json || json === "[DONE]") continue;
      try {
        const evt = JSON.parse(json);
        if (evt.type === "token" && evt.delta) onToken(evt.delta as string);
        if (evt.type === "citations" && evt.items && onCitations) onCitations(evt.items);
        if (evt.type === "done") messageId = evt.messageId;
      } catch { /* ignora pedaços incompletos */ }
    }
  }
  return { messageId };
}
