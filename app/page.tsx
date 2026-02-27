"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const TICKER_ITEMS = [
  { sym: "SOL", change: "+3.24%" },
  { sym: "JTO", change: "+1.87%" },
  { sym: "RAY", change: "-0.52%" },
  { sym: "BONK", change: "+8.41%" },
  { sym: "WIF", change: "+5.13%" },
  { sym: "PYTH", change: "-1.08%" },
  { sym: "ORCA", change: "+2.34%" },
  { sym: "MSOL", change: "+3.18%" },
];

const FEATURES = [
  {
    icon: "◈",
    title: "On-chain Portfolio",
    desc: "Real-time SPL token balances direct from Solana mainnet",
  },
  {
    icon: "◉",
    title: "AI Strategy Agent",
    desc: "OpenClaw-powered analysis of your DeFi positions and market data",
  },
  {
    icon: "◫",
    title: "TX Intelligence",
    desc: "Decoded transaction history with context and pattern detection",
  },
];

export default function LandingPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [typedText, setTypedText] = useState("");
  const fullText = "PORTFOLIO INTELLIGENCE";

  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animFrame: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 0.35, color: "153, 69, 255", speed: 0.0003 },
      { x: 0.75, y: 0.6, r: 0.3, color: "20, 241, 149", speed: 0.0004 },
      { x: 0.5, y: 0.8, r: 0.25, color: "100, 40, 200", speed: 0.00025 },
      { x: 0.1, y: 0.7, r: 0.2, color: "20, 241, 149", speed: 0.0005 },
    ];

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbs.forEach((orb, i) => {
        const ox = (orb.x + Math.sin(t * orb.speed + i * 1.2) * 0.18) * canvas.width;
        const oy = (orb.y + Math.cos(t * orb.speed * 0.7 + i) * 0.15) * canvas.height;
        const r = orb.r * Math.min(canvas.width, canvas.height);
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
        grad.addColorStop(0, `rgba(${orb.color}, 0.13)`);
        grad.addColorStop(0.5, `rgba(${orb.color}, 0.05)`);
        grad.addColorStop(1, `rgba(${orb.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      animFrame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(153, 69, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(153, 69, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          zIndex: 1,
        }}
      />

      {/* Ticker */}
      <div
        className="relative border-b overflow-hidden py-2"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          backgroundColor: "rgba(7,8,13,0.85)",
          backdropFilter: "blur(10px)",
          zIndex: 10,
        }}
      >
        <div className="flex animate-ticker whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mono text-xs px-6 flex items-center gap-2">
              <span className="gradient-text font-bold">{item.sym}</span>
              <span style={{ color: "var(--text-muted)" }}>/USDC</span>
              <span
                style={{
                  color: item.change.startsWith("+")
                    ? "var(--accent-green)"
                    : "var(--negative)",
                }}
              >
                {item.change}
              </span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav
        className="relative flex items-center justify-between px-8 py-5"
        style={{ zIndex: 10 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mono"
            style={{ background: "var(--accent-gradient)", color: "#07080d" }}
          >
            OC
          </div>
          <span className="mono text-sm font-bold tracking-widest" style={{ color: "var(--text-primary)" }}>
            OPENCLAW
          </span>
          <span
            className="mono text-xs px-2 py-0.5 rounded"
            style={{
              background: "rgba(20, 241, 149, 0.08)",
              color: "var(--accent-green)",
              border: "1px solid rgba(20, 241, 149, 0.2)",
            }}
          >
            INVESTOR
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-6"
        >
          <a
            href="https://github.com/openclaw-investor"
            className="mono text-xs hover:text-white transition-colors"
            style={{ color: "var(--text-muted)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a href="#features" className="mono text-xs transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>
            Docs
          </a>
        </motion.div>
      </nav>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <span
            className="mono text-xs tracking-[0.3em] px-4 py-2 rounded-full border"
            style={{
              color: "var(--accent-purple)",
              borderColor: "rgba(153, 69, 255, 0.3)",
              background: "rgba(153, 69, 255, 0.06)",
            }}
          >
            ◈ SOLANA · AI AGENTS · OPENCLAW
          </span>
        </motion.div>

        <div className="mb-4 overflow-hidden">
          <h1
            className="mono font-bold leading-none"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)", letterSpacing: "-0.02em" }}
          >
            <span className="gradient-text">{typedText}</span>
            <span className="animate-blink" style={{ color: "var(--accent-purple)" }}>_</span>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12 max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.7" }}
        >
          Connect your Phantom wallet. OpenClaw AI agents analyze your on-chain
          positions, decode DeFi strategies, and surface insights your portfolio
          is whispering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="glass-card rounded-2xl p-8 mb-8 animate-float"
          style={{
            maxWidth: 400,
            width: "100%",
            boxShadow: "0 0 60px rgba(153, 69, 255, 0.12), 0 20px 60px rgba(0,0,0,0.5)",
            border: "1px solid rgba(153, 69, 255, 0.18)",
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(153,69,255,0.2), rgba(20,241,149,0.1))",
                border: "1px solid rgba(153,69,255,0.3)",
              }}
            >
              ◉
            </div>
            <div className="text-center">
              <p className="mono font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                CONNECT YOUR WALLET
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Phantom · Devnet or Mainnet
              </p>
            </div>
            <WalletMultiButton />
            <p className="mono text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Read-only access · No transactions without approval
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="flex items-center gap-8 flex-wrap justify-center"
        >
          {[
            { label: "AI AGENT", value: "OPENCLAW" },
            { label: "CHAIN", value: "SOLANA" },
            { label: "LATENCY", value: "<50ms" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mono font-bold text-sm" style={{ color: "var(--accent-green)" }}>{s.value}</div>
              <div className="mono text-xs" style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features strip */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="relative px-6 py-12"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(7,8,13,0.6)",
          backdropFilter: "blur(20px)",
          zIndex: 10,
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card glass-card-hover rounded-xl p-6">
              <div className="text-2xl mb-3" style={{ color: "var(--accent-purple)" }}>{f.icon}</div>
              <h3 className="mono font-bold text-sm mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
