import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
} from "@solana/web3.js";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  logoURI?: string;
}

export interface TransactionRecord {
  signature: string;
  blockTime: number | null | undefined;
  slot: number;
  err: unknown;
  memo: string | null | undefined;
}

export async function getSolBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  const lamports = await connection.getBalance(publicKey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function getTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenBalance[]> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const balances: TokenBalance[] = tokenAccounts.value
      .map((item) => {
        const parsed = item.account.data as ParsedAccountData;
        const info = parsed.parsed?.info;
        if (!info) return null;

        const uiAmount = info.tokenAmount?.uiAmount ?? 0;
        if (uiAmount === 0) return null;

        return {
          mint: info.mint,
          symbol: "???",
          name: "Unknown Token",
          amount: info.tokenAmount?.amount ?? 0,
          decimals: info.tokenAmount?.decimals ?? 0,
          uiAmount,
        };
      })
      .filter((t): t is TokenBalance => t !== null);

    return balances;
  } catch {
    return [];
  }
}

export async function getRecentTransactions(
  connection: Connection,
  publicKey: PublicKey,
  limit = 10
): Promise<TransactionRecord[]> {
  try {
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });
    return signatures.map((sig) => ({
      signature: sig.signature,
      blockTime: sig.blockTime,
      slot: sig.slot,
      err: sig.err,
      memo: sig.memo,
    }));
  } catch {
    return [];
  }
}

export function formatSol(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTimestamp(blockTime: number | null | undefined): string {
  if (!blockTime) return "Unknown";
  const d = new Date(blockTime * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
