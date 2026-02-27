export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface OpenClawResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function sendToOpenClaw(
  messages: ChatMessage[],
  context?: {
    walletAddress?: string;
    solBalance?: number;
    portfolioValue?: number;
  }
): Promise<string> {
  const response = await fetch("/api/openclaw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      context,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenClaw error: ${err}`);
  }

  const data: OpenClawResponse = await response.json();
  return data.message;
}
