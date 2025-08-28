import { db } from "../lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import dotenv from "dotenv";
import { fetchSolanaTokenMetadata } from "./solscan";
import { getSolanaFullBalances } from "./solanaIntegration";
import { TokenInfo } from "@/types/TokenInfo";
import { DocumentData } from 'firebase/firestore';

dotenv.config();

// 🔧 Configuración
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COLLECTION_NAME = "tokens";
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

// 🧠 Cachés en memoria
const tokenCache: Record<string, TokenInfo> = {};
const priceCache: Record<string, number> = {};

interface TokenMetadata {
  address: string;
  metadata?: {
    name?: string;
    symbol?: string;
    image?: string;
    coingeckoId?: string;
  };
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
  icon?: string;
  priceUsd?: number;
  tokenSymbol?: string;
  tokenName?: string;
  tokenLogo?: string;
}

// ✅ Valida y normaliza la URL de imagen (admite IPFS y corrige http→https y GitHub raw)
export const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/default-token-icon.svg";

  try {
    // Permitir IPFS tal cual (lo maneja el componente TokenImage con gateways)
    if (url.startsWith('ipfs://')) return url;

    // Subdominio IPFS o rutas /ipfs/ ya vienen como https normalmente; asegurar https
    if (/^https?:\/\/.+/.test(url)) {
      let fixed = url.replace('http://', 'https://');
      if (fixed.includes('raw.githubusercontent.com')) {
        fixed = fixed.replace(
          'https://raw.githubusercontent.com/solana-labs/token-list/main/',
          'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/'
        );
      }
      return fixed;
    }

    // Si es una ruta que contiene /ipfs/, devolverla como https sin alterar
    if (/\/ipfs\//i.test(url) || /https?:\/\/[A-Za-z0-9]+\.ipfs\.[^/]+/i.test(url)) {
      return url.replace('http://', 'https://');
    }

    return "/default-token-icon.svg";
  } catch (e) {
    return "/default-token-icon.svg";
  }
};

// 🔁 Normaliza datos del token para ajustarlos a TokenInfo
const normalizeTokenData = (data: TokenMetadata): TokenInfo => ({
  address: data.address || "",
  symbol: data.metadata?.symbol || data.symbol || data.tokenSymbol || "???",
  name: data.metadata?.name || data.name || data.tokenName || "Unknown",
  logoURI: getValidImageUrl(data.metadata?.image || data.logoURI || data.tokenLogo || data.icon),
  icon: data.icon || undefined,
  decimals: data.decimals ?? 6,
  priceUsd: data.priceUsd ?? 0,
  coingeckoId: data.metadata?.coingeckoId ?? null,
});

// Función auxiliar para convertir DocumentData a TokenMetadata
const convertDocumentDataToTokenMetadata = (data: DocumentData, address: string): TokenMetadata => {
  return {
    address,
    metadata: data.metadata,
    symbol: data.symbol,
    name: data.name,
    decimals: data.decimals,
    logoURI: data.logoURI,
    icon: data.icon,
    priceUsd: data.priceUsd,
    tokenSymbol: data.tokenSymbol,
    tokenName: data.tokenName,
    tokenLogo: data.tokenLogo,
  };
};

// Función auxiliar para convertir Partial<TokenInfo> a TokenMetadata
const convertTokenInfoToTokenMetadata = (data: Partial<TokenInfo>, address: string): TokenMetadata => {
  return {
    address,
    symbol: data.symbol,
    name: data.name,
    decimals: data.decimals,
    logoURI: data.logoURI,
    icon: data.icon,
    priceUsd: data.priceUsd,
  };
};

// 📥 Obtiene metadata del token desde caché > Firebase > Solscan
export const fetchTokenMetadata = async (tokenAddress: string): Promise<TokenInfo | null> => {
  try {
    // Retorna si está en caché
    if (tokenCache[tokenAddress]) {
      console.log(`✅ [Cache] Metadata token para: ${tokenAddress}`);
      return tokenCache[tokenAddress];
    }

    // Consulta Firebase
    const ref = doc(db, COLLECTION_NAME, tokenAddress);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const metadata = normalizeTokenData(convertDocumentDataToTokenMetadata(snap.data(), tokenAddress));
      tokenCache[tokenAddress] = metadata;
      console.log(`✅ [Firebase] Metadata token para: ${tokenAddress}`, metadata);
      return metadata;
    }

    // Si no está en Firebase, consulta Solscan
    const solscanData = await fetchSolanaTokenMetadata(tokenAddress);
    if (!solscanData) {
      console.error(`❌ Solscan no devolvió metadata para: ${tokenAddress}`);
      return null;
    }

    // Normaliza y guarda en Firebase
    const normalized = normalizeTokenData(convertTokenInfoToTokenMetadata(solscanData, tokenAddress));

    try {
      await setDoc(ref, normalized);
      console.log(`✅ Metadata token guardada en Firebase: ${tokenAddress}`, normalized);
      
      // Verificar guardado leyendo inmediatamente
      const verifySnap = await getDoc(ref);
      if (verifySnap.exists()) {
        console.log(`✅ Verificación exitosa: token guardado correctamente en Firebase`, verifySnap.data());
      } else {
        console.warn(`⚠️ Verificación fallida: token NO encontrado después de guardar`);
      }
    } catch (err) {
      console.error(`❌ Error guardando metadata en Firebase para ${tokenAddress}:`, err);
    }

    tokenCache[tokenAddress] = normalized;
    return normalized;
  } catch (error) {
    console.error(`❌ [fetchTokenMetadata] Error procesando ${tokenAddress}:`, error);
    return null;
  }
};

// 💵 Obtiene precio token desde CoinGecko o Solscan (fallback)
export const fetchTokenPrice = async (tokenAddress: string, coingeckoId: string | null): Promise<number> => {
  try {
    if (!coingeckoId) {
      console.warn(`⚠️ Sin coingeckoId para ${tokenAddress}, usando Solscan fallback`);
      const solscan = await fetchSolanaTokenMetadata(tokenAddress);
      return solscan?.priceUsd || 0;
    }

    if (priceCache[tokenAddress]) {
      return priceCache[tokenAddress];
    }

    if (!COINGECKO_API_KEY) {
      throw new Error("Falta COINGECKO_API_KEY en variables de entorno");
    }

    const res = await axios.get<{ [id: string]: { usd: number } }>(COINGECKO_API_URL, {
      params: { ids: coingeckoId, vs_currencies: "usd" },
      headers: { Authorization: `Bearer ${COINGECKO_API_KEY}` },
    });

    const price = res.data?.[coingeckoId]?.usd || 0;
    priceCache[tokenAddress] = price;

    // Limpia caché tras timeout
    setTimeout(() => delete priceCache[tokenAddress], CACHE_TIMEOUT);

    return price;
  } catch (err) {
    console.error(`❌ [fetchTokenPrice] Error en ${tokenAddress}:`, err);
    return 0;
  }
};

// 🔁 Actualiza precios tokens de una wallet en Firebase
export const updateUserTokenPrices = async (walletAddress: string): Promise<void> => {
  try {
    console.log(`📡 Actualizando precios para wallet: ${walletAddress}`);

    const tokenAddresses = await getUserTokensFromWallet(walletAddress);

    for (const address of tokenAddresses) {
      const metadata = await fetchTokenMetadata(address);
      if (!metadata) continue;

      const price = await fetchTokenPrice(address, metadata.coingeckoId ?? null);
      if (price > 0) {
        await setDoc(doc(db, COLLECTION_NAME, address), { priceUsd: price }, { merge: true });
        console.log(`✅ Precio actualizado para ${address}: $${price}`);
      }
    }
  } catch (err) {
    console.error("❌ Error actualizando precios:", err);
  }
};

// 🔄 Loop para actualización periódica de precios
export const startPriceUpdateLoop = (walletAddress: string): void => {
  if (!walletAddress) {
    console.warn("⚠️ Dirección wallet necesaria para iniciar actualización de precios.");
    return;
  }

  setInterval(() => updateUserTokenPrices(walletAddress), CACHE_TIMEOUT);
};

// 🧾 Obtiene tokens SPL de una wallet
export const getUserTokensFromWallet = async (walletAddress: string): Promise<string[]> => {
  try {
    console.log(`🔍 [getUserTokensFromWallet] Obteniendo tokens para wallet: ${walletAddress}`);
    const { spl } = await getSolanaFullBalances(walletAddress);
    
    console.log(`📊 [getUserTokensFromWallet] Total tokens encontrados: ${spl.length}`);
    
    const withBalance = spl.filter(token => token.balance > 0);
    console.log(`💰 [getUserTokensFromWallet] Tokens con balance > 0:`, withBalance);
    
    const mints = withBalance
      .sort((a, b) => b.balance - a.balance)
      .map(token => token.mint);
      
    console.log(`🎯 [getUserTokensFromWallet] Mints a procesar:`, mints);
    return mints;
  } catch (err) {
    console.error("❌ [getUserTokensFromWallet] Error obteniendo balances de wallet:", err);
    return [];
  }
};
