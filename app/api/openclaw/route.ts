import { NextRequest, NextResponse } from "next/server";

// OpenClaw gateway default port is 18789
const OPENCLAW_URL = process.env.OPENCLAW_URL ?? "http://127.0.0.1:18789";
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN ?? "";

const SYSTEM_PROMPT = `You are an expert Solana investment advisor with deep knowledge of DeFi, tokenomics, on-chain analytics, and the Solana ecosystem. You help investors understand their portfolio and make informed decisions.

Protocols you know well: Marinade Finance, Jupiter, Orca, Raydium, Kamino, Drift.

Be concise, data-driven, and practical. Use bullet points for lists. Explain jargon in plain language.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body;

    // Append wallet context to system prompt
    const contextLines = context
      ? [
          context.walletAddress ? `Wallet: ${context.walletAddress}` : null,
          context.solBalance != null ? `SOL Balance: ${context.solBalance.toFixed(4)} SOL` : null,
          context.portfolioValue != null ? `Portfolio Value: $${context.portfolioValue.toFixed(2)} USD` : null,
        ].filter(Boolean)
      : [];

    const systemWithContext = contextLines.length > 0
      ? `${SYSTEM_PROMPT}\n\nCurrent user context:\n${contextLines.join("\n")}`
      : SYSTEM_PROMPT;

    // OpenClaw uses OpenAI-compatible API at /v1/chat/completions
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (OPENCLAW_TOKEN) {
        headers["Authorization"] = `Bearer ${OPENCLAW_TOKEN}`;
      }

      const ocResponse = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-5", // OpenClaw passes this to the configured LLM
          messages: [
            { role: "system", content: systemWithContext },
            ...messages,
          ],
          max_tokens: 1024,
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!ocResponse.ok) {
        throw new Error(`OpenClaw returned ${ocResponse.status}`);
      }

      const data = await ocResponse.json();
      // OpenAI-compatible response format
      const message = data.choices?.[0]?.message?.content ?? String(data);
      return NextResponse.json({ message });
    } catch (proxyErr) {
      console.warn("OpenClaw proxy failed, returning fallback:", proxyErr);
      const lastUser = messages?.findLast((m: { role: string }) => m.role === "user");
      return NextResponse.json({
        message: buildFallbackResponse(lastUser?.content ?? "", context),
      });
    }
  } catch (err) {
    console.error("OpenClaw route error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

function buildFallbackResponse(
  userMessage: string,
  context?: { solBalance?: number; portfolioValue?: number }
): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("balance") || lower.includes("sol")) {
    return context?.solBalance != null
      ? `Your SOL balance is ${context.solBalance.toFixed(4)} SOL (~$${context.portfolioValue?.toFixed(2) ?? "—"} USD).\n\nFor full AI analysis, start the OpenClaw gateway:\n\`\`\`\nnpm install -g openclaw\nopenclaw gateway run\n\`\`\``
      : "Connect your wallet to see your SOL balance and get AI-powered insights.";
  }

  if (lower.includes("strategy") || lower.includes("invest") || lower.includes("defi")) {
    return "To get DeFi strategy analysis, start the OpenClaw gateway:\n\n```\nnpm install -g openclaw\nopenclaw onboard\nopenclaw gateway run\n```\n\nOnce running, I can analyze your holdings and suggest Marinade staking, Jupiter swaps, or Kamino vault strategies.";
  }

  return "OpenClaw gateway is not running. Start it with:\n\n```bash\nnpm install -g openclaw\nopenclaw onboard --auth-choice apiKey --token-provider openrouter --token $OPENROUTER_API_KEY\nopenclaw gateway run\n```\n\nDefault port: **18789**. Then refresh and ask me anything about your Solana portfolio.";
}
