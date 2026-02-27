import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_URL =
  process.env.OPENCLAW_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Build system context from wallet data
    const { messages, context } = body;
    const systemContext = context
      ? [
          `Wallet: ${context.walletAddress ?? "unknown"}`,
          context.solBalance != null
            ? `SOL Balance: ${context.solBalance.toFixed(4)} SOL`
            : null,
          context.portfolioValue != null
            ? `Portfolio Value: $${context.portfolioValue.toFixed(2)} USD`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    // Attempt to proxy to OpenClaw gateway
    try {
      const ocResponse = await fetch(`${OPENCLAW_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          system: `You are an expert Solana investment advisor with deep knowledge of DeFi, tokenomics, and on-chain analytics. You help investors understand their portfolio and make informed decisions.\n\n${systemContext}`,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!ocResponse.ok) {
        throw new Error(`OpenClaw returned ${ocResponse.status}`);
      }

      const data = await ocResponse.json();
      return NextResponse.json({ message: data.message ?? data.content ?? data.response ?? String(data) });
    } catch (proxyErr) {
      // Fallback: return a helpful message when OpenClaw is not running
      console.warn("OpenClaw proxy failed, returning fallback:", proxyErr);

      const lastUserMessage = messages?.findLast(
        (m: { role: string }) => m.role === "user"
      );
      const fallback = buildFallbackResponse(
        lastUserMessage?.content ?? "",
        context
      );
      return NextResponse.json({ message: fallback });
    }
  } catch (err) {
    console.error("OpenClaw route error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function buildFallbackResponse(
  userMessage: string,
  context?: { solBalance?: number; portfolioValue?: number }
): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("balance") || lower.includes("sol")) {
    return context?.solBalance != null
      ? `Your current SOL balance is ${context.solBalance.toFixed(4)} SOL (~$${context.portfolioValue?.toFixed(2) ?? "—"} USD). To get full AI analysis, start the OpenClaw gateway with \`clawhub start\` and the \`solana-connect\` skill installed.`
      : "Connect your wallet to see your SOL balance and get AI-powered insights.";
  }

  if (lower.includes("strategy") || lower.includes("invest")) {
    return "OpenClaw strategy analysis requires the gateway to be running. Start it with `clawhub start` in your terminal, then I can analyze your portfolio and suggest DeFi strategies based on your holdings.";
  }

  return `OpenClaw gateway is not connected. Start it with:\n\`\`\`\nclawhub start\n\`\`\`\nOnce running, I can analyze your Solana portfolio, track DeFi positions, and provide personalized investment insights using the \`solana-connect\` skill.`;
}
