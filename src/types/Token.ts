export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  icon?: string;
  priceUsd?: number;
  coingeckoId?: string | null;
}

export interface TokenInfo extends Token {
  // Additional fields that might come from external APIs
  metadata?: {
    name?: string;
    symbol?: string;
    image?: string;
    description?: string;
    coingeckoId?: string;
  };
}

export interface TokenBalance {
  token: Token;
  amount: string;
  usdValue?: number;
}

export interface TokenPrice {
  address: string;
  price: number;
  timestamp: number;
}

export interface SwapRoute {
  marketInfos: {
    amm: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    lpFee: {
      amount: string;
      mint: string;
      pct: number;
    };
  }[];
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  slippageBps: number;
  otherAmountThreshold: string;
  swapMode: 'ExactIn' | 'ExactOut';
}

export interface QuoteResponse {
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  priceImpactPct: number;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
  }>;
} 