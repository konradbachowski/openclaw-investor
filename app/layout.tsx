import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Space_Mono } from "next/font/google";
import { WalletProviders } from "@/components/WalletProviders";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "OpenClaw Investor — Solana Portfolio Intelligence",
  description:
    "AI-powered investment dashboard for Solana. Connect your wallet, analyze your portfolio, and get intelligent market insights powered by OpenClaw.",
  keywords: ["Solana", "DeFi", "portfolio", "AI", "crypto", "investment"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${spaceMono.variable} antialiased bg-[#07080d] text-[#e2e4ed]`}
      >
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
