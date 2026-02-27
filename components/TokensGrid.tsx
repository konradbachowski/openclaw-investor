"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getTokenAccounts, TokenBalance } from "@/lib/solana";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// Well-known Solana token metadata
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; cgId?: string; color: string }> = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin", cgId: "usd-coin", color: "#2775CA" },
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether", cgId: "tether", color: "#26A17B" },
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": { symbol: "stSOL", name: "Lido Staked SOL", cgId: "lido-staked-sol", color: "#00A3FF" },
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": { symbol: "mSOL", name: "Marinade SOL", cgId: "marinade", color: "#4CAF50" },
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": { symbol: "BONK", name: "Bonk", cgId: "bonk", color: "#F7931A" },
  "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3": { symbol: "PYTH", name: "Pyth Network", cgId: "pyth-network", color: "#9945FF" },
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": { symbol: "JUP", name: "Jupiter", cgId: "jupiter-exchange-solana", color: "#C7F284" },
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE": { symbol: "ORCA", name: "Orca", cgId: "orca", color: "#FBAD41" },
};

// Fake sparkline data for demo purposes (7-day mini chart)
function generateSparkline(seed: number) {
  const data = [];
  let v = 50 + (seed % 30);
  for (let i = 0; i < 14; i++) {
    v += (Math.sin(i * seed * 0.3) * 8) + (Math.random() * 6 - 3);
    data.push({ v: Math.max(10, v) });
  }
  return data;
}

interface TokenCardProps {
  token: TokenBalance & { usdValue?: number; priceChange?: number };
  index: number;
}

function TokenCard({ token, index }: TokenCardProps) {
  const known = KNOWN_TOKENS[token.mint];
  const sparkData = generateSparkline(index + 1);
  const isPositive = (token.priceChange ?? 0) >= 0;
  const color = known?.color ?? "#9945FF";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card glass-card-hover rounded-xl p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mono"
            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
          >
            {(token.symbol ?? "?").slice(0, 2)}
          </div>
          <div>
            <p className="mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {token.symbol ?? "???"}
            </p>
            <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>
              {token.name ?? "Unknown"}
            </p>
          </div>
        </div>
        {token.priceChange != null && (
          <span
            className="mono text-xs px-2 py-0.5 rounded"
            style={{
              background: isPositive ? "rgba(20,241,149,0.08)" : "rgba(255,107,107,0.08)",
              color: isPositive ? "var(--accent-green)" : "var(--negative)",
              border: `1px solid ${isPositive ? "rgba(20,241,149,0.15)" : "rgba(255,107,107,0.15)"}`,
            }}
          >
            {isPositive ? "+" : ""}{token.priceChange.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div style={{ height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={isPositive ? "#14F195" : "#FF6B6B"}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Balance */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>BALANCE</p>
          <p className="mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            {token.uiAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })}
          </p>
        </div>
        {token.usdValue != null && (
          <div className="text-right">
            <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>VALUE</p>
            <p className="mono font-bold text-sm" style={{ color: "var(--accent-green)" }}>
              ${token.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {/* Mint address */}
      <p
        className="mono text-xs truncate"
        style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}
        title={token.mint}
      >
        {token.mint.slice(0, 20)}...
      </p>
    </motion.div>
  );
}

export function TokensGrid() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;

    const fetchTokens = async () => {
      setLoading(true);
      try {
        const raw = await getTokenAccounts(connection, publicKey);
        // Enrich with known token metadata
        const enriched = raw.map((t) => {
          const known = KNOWN_TOKENS[t.mint];
          return {
            ...t,
            symbol: known?.symbol ?? `${t.mint.slice(0, 4)}...`,
            name: known?.name ?? "Unknown Token",
          };
        });
        setTokens(enriched);
      } catch {
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey, connection]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl animate-pulse"
            style={{
              height: 200,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div
        className="glass-card rounded-xl p-12 text-center"
        style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
      >
        <p className="mono text-2xl mb-3" style={{ color: "var(--text-muted)" }}>◫</p>
        <p className="mono text-sm" style={{ color: "var(--text-secondary)" }}>
          No SPL tokens found
        </p>
        <p className="mono text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          Tokens with zero balance are hidden
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map((token, i) => (
        <TokenCard key={token.mint} token={token} index={i} />
      ))}
    </div>
  );
}
