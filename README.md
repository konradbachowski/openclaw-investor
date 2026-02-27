# OpenClaw Investor Dashboard

> AI-powered Solana portfolio intelligence. Built for [Spark #1 Hackathon](https://github.com/openclaw).

Connect your Phantom wallet and let OpenClaw AI agents analyze your on-chain positions, decode DeFi strategies, and surface actionable insights from your Solana portfolio.

## Features

- **Live Portfolio Tracking** — Real-time SOL balance + SPL token holdings from mainnet
- **AI Investment Agent** — OpenClaw-powered chat with context-aware portfolio analysis
- **Transaction History** — Decoded TX timeline with direct Solscan links
- **Price Data** — 24h change tracking via CoinGecko
- **Bloomberg Terminal aesthetic** — Dark glassmorphism UI with Solana brand colors

## Architecture

```
Frontend (Next.js 16)          OpenClaw Gateway
     │                              │
     ├─ /dashboard ──────────────── │
     │   ├─ PortfolioHero           │
     │   ├─ TokensGrid              │
     │   ├─ TransactionTimeline     │
     │   └─ AIChatSidebar ──POST──► localhost:3001/chat
     │                              │   └─ solana-connect skill
     └─ /api/openclaw (proxy)       │       └─ Solana RPC (mainnet)
                                    └─ OpenRouter LLM
```

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/openclaw-investor
cd apps/openclaw-investor
npm install
```

### 2. Start the web app

```bash
npm run dev
# App runs at http://localhost:3000
```

### 3. Set up OpenClaw AI agent (optional)

The app works without OpenClaw — you get portfolio data but the AI chat shows a setup prompt.

To enable full AI features:

```bash
# Install OpenClaw
npm install -g openclaw@latest

# Onboard (connects to OpenRouter)
openclaw onboard \
  --auth-choice apiKey \
  --token-provider openrouter \
  --token $OPENROUTER_API_KEY

# Install Solana skill (Seenfinity)
git clone https://github.com/Seenfinity/openclaw-solana-connect.git
cd openclaw-solana-connect && npm install

# Start the gateway
openclaw gateway run
# Gateway starts at http://127.0.0.1:18789
```

### 4. Connect your wallet

Open `http://localhost:3000`, click "Connect Wallet", select Phantom. Works with mainnet and devnet.

## Environment Variables

Create `.env.local` for custom configuration:

```bash
# Custom Solana RPC (recommended for production)
NEXT_PUBLIC_SOLANA_RPC=https://your-rpc.helius.xyz/?api-key=YOUR_KEY

# OpenClaw gateway (default: http://127.0.0.1:18789)
OPENCLAW_URL=http://127.0.0.1:18789

# OpenClaw gateway auth token (from: openclaw doctor)
OPENCLAW_TOKEN=your_token_here
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind v4 |
| Wallet | `@solana/wallet-adapter-react` + Phantom |
| On-chain | `@solana/web3.js` (direct RPC) |
| AI Agent | OpenClaw + `solana-connect` skill |
| LLM | OpenRouter (model configurable) |
| Animations | Framer Motion |
| Charts | Recharts |
| Fonts | Space Mono + Geist |

## OpenClaw Configuration

See [`openclaw-config/`](./openclaw-config/) for:

- `openclaw.json` — gateway configuration template
- `agent-instructions.md` — system prompt and agent behavior guidelines
- `skills/INSTALL.md` — step-by-step skill installation

## Hackathon Notes

Built for **Spark #1** — AI + Solana category.

The app demonstrates integrating OpenClaw as an AI agent backend for a consumer-facing Solana investment tool. The `solana-connect` skill provides on-chain data access while OpenRouter handles LLM inference.

Budget request: **$1,500** for infrastructure and LLM costs during evaluation period.

## License

MIT — open source, contributions welcome.
