"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getRecentTransactions, TransactionRecord, formatTimestamp } from "@/lib/solana";
import { motion } from "framer-motion";

function TxIcon({ err }: { err: unknown }) {
  if (err) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs mono shrink-0"
        style={{ background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.25)", color: "#FF6B6B" }}
      >
        ✕
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs mono shrink-0"
      style={{ background: "rgba(20,241,149,0.1)", border: "1px solid rgba(20,241,149,0.2)", color: "var(--accent-green)" }}
    >
      ✓
    </div>
  );
}

function TxRow({ tx, index }: { tx: TransactionRecord; index: number }) {
  const short = `${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)}`;
  const hasErr = !!tx.err;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 py-3 group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <TxIcon err={tx.err} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <a
            href={`https://solscan.io/tx/${tx.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs transition-colors group-hover:text-white"
            style={{ color: "var(--text-secondary)" }}
          >
            {short}
          </a>
          <span
            className="mono text-xs px-1.5 py-0.5 rounded"
            style={{
              fontSize: "0.6rem",
              background: hasErr ? "rgba(255,107,107,0.1)" : "rgba(20,241,149,0.07)",
              color: hasErr ? "#FF6B6B" : "var(--accent-green)",
            }}
          >
            {hasErr ? "FAILED" : "SUCCESS"}
          </span>
          {tx.memo && (
            <span className="mono text-xs truncate max-w-32" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
              {tx.memo}
            </span>
          )}
        </div>
        <p className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
          Slot #{tx.slot.toLocaleString()}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="mono text-xs" style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
          {formatTimestamp(tx.blockTime)}
        </p>
        <a
          href={`https://solscan.io/tx/${tx.signature}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs transition-colors hover:text-white opacity-0 group-hover:opacity-100"
          style={{ color: "var(--accent-purple)", fontSize: "0.65rem" }}
        >
          View ↗
        </a>
      </div>
    </motion.div>
  );
}

export function TransactionTimeline() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) return;
    setLoading(true);

    getRecentTransactions(connection, publicKey, 15)
      .then(setTxs)
      .catch(() => setTxs([]))
      .finally(() => setLoading(false));
  }, [publicKey, connection]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="mono text-xs tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
            TRANSACTION HISTORY
          </p>
          <p className="mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Recent Activity
          </p>
        </div>
        {publicKey && (
          <a
            href={`https://solscan.io/account/${publicKey.toBase58()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-xs hover:text-white transition-colors"
            style={{ color: "var(--accent-purple)" }}
          >
            View all ↗
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg animate-pulse"
              style={{ background: "rgba(255,255,255,0.03)", animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : txs.length === 0 ? (
        <p className="mono text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
          No transactions found
        </p>
      ) : (
        <div>
          {txs.map((tx, i) => (
            <TxRow key={tx.signature} tx={tx} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
