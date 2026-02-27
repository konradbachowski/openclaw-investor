# Setting up OpenClaw + Solana

## 1. Install OpenClaw

```bash
npm install -g openclaw@latest
```

## 2. Onboard (first-time setup)

```bash
# Interactive wizard
openclaw onboard

# Or with OpenRouter directly
openclaw onboard \
  --auth-choice apiKey \
  --token-provider openrouter \
  --token $OPENROUTER_API_KEY
```

This creates `~/.openclaw/openclaw.json`. Optionally copy the template from this repo:

```bash
cp openclaw-config/openclaw.json ~/.openclaw/openclaw.json
# then edit model/key
```

## 3. Install Solana skill

**Option A — openclaw-solana-connect (recommended)**

```bash
git clone https://github.com/Seenfinity/openclaw-solana-connect.git
cd openclaw-solana-connect && npm install
```

Configure env in `~/.openclaw/openclaw.json`:
```json
{
  "env": {
    "SOLANA_RPC_URL": "https://api.mainnet-beta.solana.com",
    "OPENROUTER_API_KEY": "sk-or-..."
  }
}
```

**Option B — solana-skills via Playbooks**

```bash
npx playbooks add skill openclaw/skills --skill solana-skills
```

## 4. Start the gateway

```bash
openclaw gateway run
# Gateway starts at http://127.0.0.1:18789
```

Keep running in background:
```bash
npm install -g pm2
pm2 start "openclaw gateway run" --name openclaw
pm2 save
```

## 5. Verify connection

```bash
openclaw doctor
openclaw status
```

Check the web app at `http://localhost:3000/dashboard` — AI chat should respond with live analysis.

## 6. Configure the web app

Create `apps/openclaw-investor/.env.local`:

```bash
# OpenClaw gateway (default: http://127.0.0.1:18789)
OPENCLAW_URL=http://127.0.0.1:18789

# Gateway auth token (from openclaw doctor output)
OPENCLAW_TOKEN=your_gateway_token_here

# Optional: custom Solana RPC
NEXT_PUBLIC_SOLANA_RPC=https://your-rpc.helius.xyz/?api-key=YOUR_KEY
```

## Troubleshooting

**Port in use:**
```bash
openclaw gateway run --port 18790 --force
# then set OPENCLAW_URL=http://127.0.0.1:18790 in .env.local
```

**Check logs:**
```bash
openclaw logs
```

**Reset gateway:**
```bash
openclaw reset
openclaw gateway run
```
