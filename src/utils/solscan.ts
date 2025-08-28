import axios from "axios";
import { TokenInfo } from "@/types/TokenInfo";

const SOLSCAN_API_KEY = process.env.NEXT_PUBLIC_SOLSCAN_API_TOKEN;

if (!SOLSCAN_API_KEY) {
  console.error("🚨 ERROR: NEXT_PUBLIC_SOLSCAN_API_TOKEN no está definido en variables de entorno.");
}
const SOLSCAN_META_URL = "https://pro-api.solscan.io/v2.0/token/meta";

interface SolscanMetadata {
  address: string;
  name?: string;
  symbol?: string;
  icon?: string;
  decimals?: number;
  holder?: number;
  price?: number;
  metadata?: {
    name?: string;
    symbol?: string;
    image?: string;
    coingeckoId?: string;
    description?: string;
    twitter?: string;
    website?: string;
  };
}

interface SolscanResponse {
  success: boolean;
  data?: SolscanMetadata;
}

interface SolscanError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message: string;
}

/**
 * 🔹 Obtiene metadata token desde API Pro de Solscan
 */
export const fetchSolanaTokenMetadata = async (
  tokenAddress: string
): Promise<Partial<TokenInfo> | null> => {
  try {
    console.log(`📡 [Solscan] Obteniendo metadata para: ${tokenAddress}`);

    const response = await axios.get<SolscanResponse>(SOLSCAN_META_URL, {
      params: { address: tokenAddress },
      headers: { token: SOLSCAN_API_KEY },
    });

    const { data } = response;

    if (!data.success || !data.data) {
      console.warn(`⚠️ [Solscan] Respuesta incompleta o fallida para: ${tokenAddress}`);
      return null;
    }

    const token = data.data;

    const metadata: Partial<TokenInfo> = {
      address: token.address,
      name: token.metadata?.name || token.name || "Unknown",
      symbol: token.metadata?.symbol || token.symbol || "???",
      logoURI: token.metadata?.image || token.icon || "/solicon.png",
      icon: token.icon,
      decimals: token.decimals ?? 6,
      priceUsd: token.price ?? 0,
      coingeckoId: token.metadata?.coingeckoId || null,
    };

    console.log(`✅ [Solscan] Metadata recibida para: ${tokenAddress}`);
    return metadata;
  } catch (error) {
    const solscanError = error as SolscanError;
    console.error(
      `❌ [fetchSolanaTokenMetadata] Error para ${tokenAddress}:`,
      solscanError.response?.data || solscanError.message
    );
    return null;
  }
};
