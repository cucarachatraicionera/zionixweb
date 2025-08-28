import axios from 'axios';
import { Token } from '@/types/Token';
import { getTokenImageUrl } from '@/utils/tokens';

const SOLSCAN_API_BASE = 'https://api.solscan.io';
const SOLSCAN_API_KEY = process.env.NEXT_PUBLIC_SOLSCAN_API_TOKEN;
const SOLSCAN_META_URL = "https://pro-api.solscan.io/v2.0/token/meta";

if (!SOLSCAN_API_KEY) {
  console.error("🚨 ERROR: SOLSCAN_API_TOKEN no está definido en .env");
}

interface SolscanResponse {
  success: boolean;
  data?: {
    address: string;
    name?: string;
    symbol?: string;
    icon?: string;
    decimals?: number;
    price?: number;
    metadata?: {
      name?: string;
      symbol?: string;
      image?: string;
      coingeckoId?: string;
    };
  };
}

export const fetchTokenInfo = async (address: string): Promise<Token> => {
  try {
    const response = await fetch(SOLSCAN_META_URL, {
      method: 'GET',
      headers: {
        'token': SOLSCAN_API_KEY || '',
      }
    });

    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.statusText}`);
    }

    const data: SolscanResponse = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response from Solscan');
    }

    const tokenData = data.data;

    // Transform the data into our Token type
    const token: Token = {
      address: address,
      name: tokenData.metadata?.name || tokenData.name || 'Unknown Token',
      symbol: tokenData.metadata?.symbol || tokenData.symbol || '???',
      decimals: tokenData.decimals || 9,
      logoURI: getTokenImageUrl(tokenData.metadata?.image || tokenData.icon),
      icon: tokenData.icon,
      coingeckoId: tokenData.metadata?.coingeckoId || null,
      priceUsd: tokenData.price || 0
    };

    return token;
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw new Error('Failed to fetch token information');
  }
};

// Función auxiliar para validar direcciones de Solana
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Función para obtener el balance de un token
export async function getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
  try {
    const response = await axios.get(`${SOLSCAN_API_BASE}/account/tokens`, {
      params: { account: walletAddress },
      headers: {
        'accept': 'application/json',
        'token': process.env.NEXT_PUBLIC_SOLSCAN_API_KEY
      }
    });

    const token = response.data.find((t: any) => t.tokenAddress === tokenAddress);
    return token ? token.tokenAmount.amount : '0';
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
}

// Función para obtener el precio actual de un token
export async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    const response = await axios.get(`${SOLSCAN_API_BASE}/market/token/${tokenAddress}`, {
      headers: {
        'accept': 'application/json',
        'token': process.env.NEXT_PUBLIC_SOLSCAN_API_KEY
      }
    });

    return response.data.priceUsdt || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
} 