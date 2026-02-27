"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortenAddress } from "@/lib/solana";

export function WalletButton() {
  const { publicKey } = useWallet();

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--accent-green)" }}
        />
        <span className="mono text-xs" style={{ color: "var(--accent-green)" }}>
          {shortenAddress(publicKey.toBase58())}
        </span>
        <WalletMultiButton />
      </div>
    );
  }

  return <WalletMultiButton />;
}
