# Installing the `solana-connect` Skill

## Prerequisites

- OpenClaw CLI installed: `npm install -g clawhub`
- Node.js 18+
- An OpenRouter API key

## Installation

```bash
# Install the solana-connect skill
clawhub install solana-connect

# Verify installation
clawhub skills list
```

## Configuration

1. Set your OpenRouter API key:
```bash
export OPENROUTER_API_KEY=your_key_here
```

2. Copy the config template:
```bash
cp openclaw-config/openclaw.json ~/.clawhub/config.json
```

3. Edit `~/.clawhub/config.json` and update the `llm.model` field to your preferred model.

## Starting the Gateway

```bash
# From the project root
clawhub start

# The gateway will start at http://localhost:3001
# The web app expects it at this address
```

## Verifying the Connection

Once running, the AI chat sidebar in the investor dashboard will show the agent as connected. You can test by:

1. Opening the dashboard at `http://localhost:3000/dashboard`
2. Clicking the AI Agent button (or the floating ◉ button)
3. Typing "Analyze my portfolio"

## Troubleshooting

**Gateway not responding:** Check that port 3001 is not in use:
```bash
lsof -i :3001
```

**solana-connect not found:**
```bash
clawhub update
clawhub install solana-connect --force
```

**RPC rate limiting:** The app uses the public Solana RPC by default. For production, configure a custom RPC in `openclaw.json`:
```json
"solanaRpc": "https://your-rpc.helius.xyz/?api-key=YOUR_KEY"
```
