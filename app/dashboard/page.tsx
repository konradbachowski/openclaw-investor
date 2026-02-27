"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PortfolioHero } from "@/components/PortfolioHero";
import { TokensGrid } from "@/components/TokensGrid";
import { TransactionTimeline } from "@/components/TransactionTimeline";
import { AIChatSidebar } from "@/components/AIChatSidebar";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!connected) {
      router.push("/");
    }
  }, [connected, router]);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <p className="mono text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Wallet disconnected. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Background gradient mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 10% 20%, rgba(153,69,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 70%, rgba(20,241,149,0.05) 0%, transparent 60%)
          `,
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(7,8,13,0.9)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mono"
              style={{ background: "var(--accent-gradient)", color: "#07080d" }}
            >
              OC
            </div>
            <span className="mono text-sm font-bold tracking-widest" style={{ color: "var(--text-primary)" }}>
              OPENCLAW
            </span>
            <span
              className="mono text-xs px-2 py-0.5 rounded hidden sm:inline"
              style={{
                background: "rgba(20,241,149,0.08)",
                color: "var(--accent-green)",
                border: "1px solid rgba(20,241,149,0.18)",
              }}
            >
              INVESTOR
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatOpen(true)}
              className="mono text-xs px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              style={{
                background: chatOpen ? "rgba(153,69,255,0.15)" : "rgba(153,69,255,0.08)",
                border: "1px solid rgba(153,69,255,0.3)",
                color: "var(--accent-purple)",
              }}
            >
              <span>◈</span> AI Agent
            </button>
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-screen-xl mx-auto px-6 py-8 space-y-6" style={{ zIndex: 1 }}>
        {/* Portfolio hero */}
        <PortfolioHero />

        {/* Tokens section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="mono text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>TOKEN HOLDINGS</p>
            </div>
            <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>Mainnet · Live</span>
          </div>
          <TokensGrid />
        </motion.section>

        {/* Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <TransactionTimeline />
        </motion.section>
      </main>

      {/* AI Chat Sidebar */}
      <AIChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating AI button (when sidebar closed) */}
      {!chatOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-lg z-40 transition-all duration-200 hover:scale-110"
          style={{
            background: "var(--accent-gradient)",
            color: "#07080d",
            boxShadow: "0 0 30px rgba(153,69,255,0.4), 0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          ◉
        </motion.button>
      )}
    </div>
  );
}
