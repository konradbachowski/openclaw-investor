"use client";

import { useEffect, useState, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getSolBalance, shortenAddress } from "@/lib/solana";
import { motion } from "framer-motion";

interface SolPrice {
  usd: number;
  usd_24h_change: number;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(target * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export function PortfolioHero() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<SolPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [balance, priceRes] = await Promise.all([
          getSolBalance(connection, publicKey),
          fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true"
          ).then((r) => r.json()),
        ]);
        setSolBalance(balance);
        if (priceRes?.solana) {
          setSolPrice({
            usd: priceRes.solana.usd,
            usd_24h_change: priceRes.solana.usd_24h_change,
          });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey, connection]);

  const usdValue = solBalance * (solPrice?.usd ?? 0);
  const animatedUsd = useCountUp(usdValue, 1400);
  const animatedSol = useCountUp(solBalance, 1200);
  const isPositive = (solPrice?.usd_24h_change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-8 relative overflow-hidden"
      style={{
        border: "1px solid rgba(153, 69, 255, 0.2)",
        boxShadow: "0 0 80px rgba(153, 69, 255, 0.08), 0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(153,69,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="mono text-xs tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              TOTAL PORTFOLIO VALUE
            </p>
            {loading ? (
              <div className="h-16 w-48 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
            ) : (
              <div>
                <h2
                  className="mono font-bold"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}
                >
                  <span className="gradient-text">
                    ${animatedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </h2>
                <p className="mono text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  {animatedSol.toFixed(4)} SOL
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 items-end">
            {publicKey && (
              <div
                className="mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2"
                style={{
                  background: "rgba(20, 241, 149, 0.07)",
                  border: "1px solid rgba(20, 241, 149, 0.15)",
                  color: "var(--text-secondary)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-green)" }} />
                {shortenAddress(publicKey.toBase58(), 6)}
              </div>
            )}
            {solPrice && (
              <div className="flex items-center gap-3">
                <div>
                  <p className="mono text-xs" style={{ color: "var(--text-muted)" }}>SOL PRICE</p>
                  <p className="mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    ${solPrice.usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div
                  className="mono text-xs px-2 py-1 rounded"
                  style={{
                    background: isPositive ? "rgba(20,241,149,0.1)" : "rgba(255,107,107,0.1)",
                    color: isPositive ? "var(--accent-green)" : "var(--negative)",
                    border: `1px solid ${isPositive ? "rgba(20,241,149,0.2)" : "rgba(255,107,107,0.2)"}`,
                  }}
                >
                  {isPositive ? "+" : ""}{solPrice.usd_24h_change.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mini stat row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "SOL BALANCE", value: loading ? "—" : `${solBalance.toFixed(4)} SOL` },
            { label: "USD VALUE", value: loading ? "—" : `$${usdValue.toFixed(2)}` },
            { label: "24H CHANGE", value: solPrice ? `${isPositive ? "+" : ""}${((usdValue * solPrice.usd_24h_change) / 100).toFixed(2)}$` : "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="mono text-xs mb-1" style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                {stat.label}
              </p>
              <p className="mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
