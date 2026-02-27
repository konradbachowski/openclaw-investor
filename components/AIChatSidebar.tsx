"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendToOpenClaw, ChatMessage } from "@/lib/openclaw";
import { getSolBalance } from "@/lib/solana";

const QUICK_PROMPTS = [
  "Analyze my portfolio",
  "Best DeFi strategies for SOL holders?",
  "What is liquid staking?",
  "Explain my recent transactions",
];

interface AIChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs mono mr-2 shrink-0 mt-0.5"
          style={{
            background: "var(--accent-gradient)",
            color: "#07080d",
            fontSize: "0.6rem",
            fontWeight: "bold",
          }}
        >
          OC
        </div>
      )}
      <div
        className="max-w-[85%] rounded-xl px-4 py-3"
        style={
          isUser
            ? {
                background: "rgba(153,69,255,0.15)",
                border: "1px solid rgba(153,69,255,0.25)",
                color: "var(--text-primary)",
              }
            : {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-primary)",
              }
        }
      >
        <p className="text-sm" style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {msg.content}
        </p>
        <p className="mono text-xs mt-1" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
          {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs mono mr-2 shrink-0"
        style={{ background: "var(--accent-gradient)", color: "#07080d", fontSize: "0.6rem", fontWeight: "bold" }}
      >
        OC
      </div>
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: "var(--accent-purple)",
              animationDelay: `${i * 200}ms`,
              animationDuration: "800ms",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function AIChatSidebar({ open, onClose }: AIChatSidebarProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your OpenClaw AI investment agent. I can analyze your Solana portfolio, explain DeFi strategies, and help you make sense of your on-chain activity.\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let solBalance: number | undefined;
      if (publicKey) {
        try {
          solBalance = await getSolBalance(connection, publicKey);
        } catch {
          // ignore
        }
      }

      const reply = await sendToOpenClaw([...messages, userMsg], {
        walletAddress: publicKey?.toBase58(),
        solBalance,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Failed to reach AI agent"}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            style={{
              width: "min(420px, 100vw)",
              background: "rgba(10, 11, 18, 0.97)",
              borderLeft: "1px solid rgba(153,69,255,0.2)",
              backdropFilter: "blur(30px)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mono"
                  style={{ background: "var(--accent-gradient)", color: "#07080d" }}
                >
                  OC
                </div>
                <div>
                  <p className="mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    OpenClaw AI
                  </p>
                  <p className="mono text-xs flex items-center gap-1.5" style={{ color: "var(--accent-green)", fontSize: "0.65rem" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-green)", display: "inline-block" }}
                    />
                    Investment Agent
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div
                className="px-4 py-3 flex gap-2 flex-wrap"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="mono text-xs px-3 py-1.5 rounded-lg transition-all duration-150 hover:border-purple-400/40"
                    style={{
                      background: "rgba(153,69,255,0.07)",
                      border: "1px solid rgba(153,69,255,0.18)",
                      color: "var(--text-secondary)",
                      fontSize: "0.68rem",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="flex gap-2 rounded-xl p-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(153,69,255,0.2)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your portfolio..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none px-3 py-2.5 text-sm outline-none"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-geist), sans-serif",
                    minHeight: 44,
                    maxHeight: 120,
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="rounded-lg px-3 py-2 mono text-xs transition-all duration-150 self-end mb-1 mr-1"
                  style={{
                    background: input.trim() && !loading ? "var(--accent-gradient)" : "rgba(255,255,255,0.05)",
                    color: input.trim() && !loading ? "#07080d" : "var(--text-muted)",
                    fontWeight: "bold",
                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    minWidth: 44,
                  }}
                >
                  {loading ? "..." : "↑"}
                </button>
              </div>
              <p className="mono text-xs mt-2 text-center" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>
                Enter to send · Shift+Enter for new line · Powered by OpenClaw
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
