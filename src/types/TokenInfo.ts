// Re-export TokenInfo from Token.ts to avoid duplication and keep a single source of truth
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  icon?: string;
  priceUsd?: number;
  coingeckoId?: string | null;
  balance?: string;
}
