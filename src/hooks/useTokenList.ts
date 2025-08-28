import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { TokenInfo } from '@/types/TokenInfo';
import { DEFAULT_TOKENS, sortTokens, PRIORITY_TOKENS, preloadTokenImages, getCachedTokenImage } from '@/utils/tokens';
import { fetchTokenMetadata, getUserTokensFromWallet } from '@/utils/fetchTokenMetadata';
import { useWalletContext } from '@/contexts/walletContext';

const TOP_TOKENS = [
  // Trump
  '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN',
  // USDC
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  // Jupiter
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  // USDT
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  // JITO
  'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
  // Grass
  'Grass7B4RdKfBCjTKgSqnXkqjwiGvQyFbuSCUJr3XXjs',
  // Render
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
  // Jupiter Perps LP
  '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
  // Bonk
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  // Raydium
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
];

const SOL_TOKEN: TokenInfo = {
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'SOL',
  name: 'Wrapped SOL',
  decimals: 9,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  priceUsd: 0,
  coingeckoId: null,
  balance: undefined,
};

// Helper function to get token balance from wallet
const getTokenBalanceFromWallet = async (walletAddress: string, mintAddress: string): Promise<number> => {
  try {
    const { getSolanaFullBalances } = await import('@/utils/solanaIntegration');
    const balances = await getSolanaFullBalances(walletAddress);
    const token = balances.spl.find(t => t.mint === mintAddress);
    return token?.balance || 0;
  } catch {
    return 0;
  }
};

export const useTokenList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [allTokensLoaded, setAllTokensLoaded] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const { publicKey } = useWalletContext();
  const [walletTokensLoaded, setWalletTokensLoaded] = useState(false);

  // Load tokens from Firebase with image caching
  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        // Check cache first
        const cached = localStorage.getItem('topTokens');
        let allTokens: TokenInfo[] = [];
        
        if (cached) {
          allTokens = JSON.parse(cached);
          console.log('✅ [useTokenList] Loaded from cache:', allTokens.length, 'tokens');
        } else {
          // Load from Firebase
          console.log('🚀 [useTokenList] Loading tokens from Firebase...');
          
          const q = query(collection(db, 'tokens'), where('address', 'in', TOP_TOKENS));
          const snapshot = await getDocs(q);
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.symbol) {
              allTokens.push({
                address: data.address || '',
                symbol: data.symbol || '',
                name: data.name || data.symbol || '',
                decimals: data.decimals ?? 6,
                logoURI: data.logoURI || data.icon || '/default-token-icon.svg',
                icon: data.icon || data.logoURI || '/default-token-icon.svg',
                priceUsd: data.priceUsd || 0,
                coingeckoId: data.coingeckoId || null,
                balance: data.balance || undefined,
              });
            }
          });
          
          // Fetch metadata for any missing tokens
          const foundAddresses = new Set(allTokens.map((t) => t.address));
          const missingTop = TOP_TOKENS.filter((addr) => !foundAddresses.has(addr));
          
          if (missingTop.length > 0) {
            const fetched = await Promise.all(
              missingTop.map(async (addr) => {
                try {
                  const meta = await fetchTokenMetadata(addr);
                  if (!meta) return null;
                  return {
                    address: addr,
                    symbol: meta.symbol,
                    name: meta.name || meta.symbol,
                    decimals: meta.decimals ?? 6,
                    logoURI: meta.logoURI || '/default-token-icon.svg',
                    icon: meta.icon || meta.logoURI || '/default-token-icon.svg',
                    priceUsd: meta.priceUsd || 0,
                    coingeckoId: meta.coingeckoId || null,
                  };
                } catch {
                  return null;
                }
              })
            );
            allTokens = [...allTokens, ...fetched.filter(Boolean) as TokenInfo[]];
          }
          
          // Cache the results
          localStorage.setItem('topTokens', JSON.stringify(allTokens));
          console.log('✅ [useTokenList] Loaded from Firebase and cached:', allTokens.length, 'tokens');
        }
        
        // ALWAYS ensure SOL is present in the token list
        const solAddress = 'So11111111111111111111111111111111111111112';
        if (!allTokens.some(t => t.address === solAddress)) {
          console.log('🔧 [useTokenList] Adding SOL token to list...');
          allTokens.unshift({
            address: solAddress,
            symbol: 'SOL',
            name: 'Wrapped SOL',
            decimals: 9,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            priceUsd: 0,
            coingeckoId: null,
            balance: undefined,
          });
        }
        
        // Preload images for all tokens
        console.log('🚀 [useTokenList] Preloading images for', allTokens.length, 'tokens...');
        await preloadTokenImages(allTokens);
        
        // Sort and set tokens
        const sorted = sortTokens(allTokens);
        setTokens(sorted);
        
        console.log('✅ [useTokenList] Final token list:', sorted.map(t => t.symbol));
        
      } catch (err) {
        setError('Error loading tokens');
        console.error('❌ [useTokenList] Error loading tokens:', err);
        
        // Fallback to basic tokens if everything fails
        const fallbackTokens = DEFAULT_TOKENS.map((t) => ({
          address: t.address,
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          logoURI: t.logoURI,
          icon: t.icon,
          priceUsd: t.priceUsd,
          coingeckoId: t.coingeckoId ?? null,
        }));
        setTokens(fallbackTokens);
      } finally {
        setLoading(false);
      }
    };
    
    loadTokens();
  }, []); // Run only once on mount

  // Cargar el resto de tokens en lotes de 100 cuando se abre el TokenSelector
  const loadMoreTokens = useCallback(async () => {
    if (allTokensLoaded) return;
    setLoading(true);
    setError(null);
    try {
      // Buscar en cache
      const cached = localStorage.getItem('allTokens');
      if (cached) {
        setTokens(JSON.parse(cached));
        setAllTokensLoaded(true);
        setLoading(false);
        return;
      }
      let q;
      if (lastDoc) {
        q = query(collection(db, 'tokens'), startAfter(lastDoc), limit(100));
      } else {
        q = query(collection(db, 'tokens'), limit(100));
      }
      const snapshot = await getDocs(q);
      const newTokens: TokenInfo[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.symbol && !TOP_TOKENS.includes(data.address)) {
          newTokens.push({
            address: data.address || '',
            symbol: data.symbol || '',
            name: data.name || data.symbol || '',
            decimals: data.decimals ?? 6,
            logoURI: data.logoURI || data.icon || '/default-token-icon.svg',
            icon: data.icon || data.logoURI || '/default-token-icon.svg',
            priceUsd: data.priceUsd || 0,
            coingeckoId: data.coingeckoId || null,
            balance: data.balance || undefined,
          });
        }
      });
      setTokens((prev) => [...prev, ...newTokens]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.size < 100) {
        setAllTokensLoaded(true);
        localStorage.setItem('allTokens', JSON.stringify([...tokens, ...newTokens]));
      }
    } catch (err) {
      setError('Error loading more tokens');
    } finally {
      setLoading(false);
    }
  }, [allTokensLoaded, lastDoc, tokens]);

  const importToken = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Validate Solana address format
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(tokenAddress)) {
        throw new Error('Invalid Solana token address format');
      }

      // Check if token already exists
      const existingToken = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
      if (existingToken) {
        return true;
      }
      
      // Fetch token metadata and save to Firebase
      const metadata = await fetchTokenMetadata(tokenAddress);
      
      if (!metadata || !metadata.symbol) {
        throw new Error('Unable to fetch token metadata or invalid token');
      }

      // Add to local state immediately for better UX
      const newToken: TokenInfo = {
        address: tokenAddress,
        symbol: metadata.symbol,
        name: metadata.name || metadata.symbol,
        decimals: metadata.decimals ?? 6,
        logoURI: metadata.logoURI || '/default-token-icon.svg',
        icon: metadata.icon || metadata.logoURI || '/default-token-icon.svg',
        priceUsd: metadata.priceUsd || 0,
        coingeckoId: metadata.coingeckoId || null,
      };

      // Update local tokens state
      setTokens(prevTokens => {
        const updatedTokens = [...prevTokens, newToken].filter((t, i, self) => i === self.findIndex((s) => s.address === t.address));
        return sortTokens(updatedTokens);
      });

      return true;

    } catch (err: any) {
      setError(err.message || 'Failed to import token');
      return false;
    }
  }, [tokens]);

  // Auto-incluir tokens que el usuario ya posee en su wallet (con balance > 0)
  useEffect(() => {
    const includeWalletTokens = async () => {
      try {
        if (!publicKey || walletTokensLoaded) return;
        
        console.log(`🔍 [useTokenList] Incluyendo tokens del wallet: ${publicKey}`);
        setLoading(true);
        
        const mints = await getUserTokensFromWallet(publicKey);
        console.log(`📋 [useTokenList] Mints encontrados:`, mints);
        
        if (!mints || mints.length === 0) {
          console.log(`⚠️ [useTokenList] No se encontraron mints en el wallet`);
          setWalletTokensLoaded(true);
          setLoading(false);
          return;
        }

        // Fetch metadata for each mint
        console.log(`📡 [useTokenList] Obteniendo metadata para ${mints.length} mints...`);
        const metas = await Promise.all(
          mints.map(async (mint) => {
            try {
              console.log(`🔍 [useTokenList] Obteniendo metadata para mint: ${mint}`);
              const meta = await fetchTokenMetadata(mint);
              if (!meta) {
                console.log(`❌ [useTokenList] No se pudo obtener metadata para: ${mint}`);
                return null;
              }
              
              // Add balance info from wallet
              const balance = await getTokenBalanceFromWallet(publicKey, mint);
              console.log(`💰 [useTokenList] Balance para ${mint} (${meta.symbol}): ${balance}`);
              
              return {
                ...meta,
                balance: balance > 0 ? balance.toString() : undefined
              };
            } catch (err) {
              console.error(`❌ [useTokenList] Error procesando mint ${mint}:`, err);
              return null;
            }
          })
        );

        const walletTokens = metas.filter(Boolean) as TokenInfo[];
        console.log(`✅ [useTokenList] Tokens del wallet procesados:`, walletTokens);
        
        if (walletTokens.length === 0) {
          console.log(`⚠️ [useTokenList] No se pudieron procesar tokens del wallet`);
          setWalletTokensLoaded(true);
          setLoading(false);
          return;
        }

        // Merge wallet tokens FIRST, then existing tokens
        setTokens((prev) => {
          console.log(`🔄 [useTokenList] Tokens previos:`, prev.length);
          console.log(`🆕 [useTokenList] Nuevos tokens del wallet:`, walletTokens.length);
          
          const merged = [...walletTokens, ...prev].filter(
            (t, i, self) => i === self.findIndex((s) => s.address === t.address)
          );
          
          console.log(`🔗 [useTokenList] Tokens después de merge:`, merged.length);
          
          // Sort: wallet tokens first (with balance), then priority tokens, then others
          const sorted = merged.sort((a, b) => {
            // Wallet tokens with balance first
            if (a.balance && !b.balance) return -1;
            if (!a.balance && b.balance) return 1;
            // Then priority order
            const aPriority = PRIORITY_TOKENS.indexOf(a.symbol.toUpperCase());
            const bPriority = PRIORITY_TOKENS.indexOf(b.symbol.toUpperCase());
            if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
            if (aPriority !== -1) return -1;
            if (bPriority !== -1) return 1;
            // Then alphabetically
            return (a.symbol || '').localeCompare(b.symbol || '');
          });
          
          console.log(`📊 [useTokenList] Tokens finales ordenados:`, sorted.map(t => `${t.symbol} (${t.balance || '0'})`));
          return sorted;
        });
        
        setWalletTokensLoaded(true);
      } catch (err) {
        console.error('❌ [useTokenList] Failed including wallet tokens', err);
        setWalletTokensLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    includeWalletTokens();
  }, [publicKey, walletTokensLoaded]);

  return {
    tokens,
    loading,
    error,
    loadMoreTokens,
    allTokensLoaded,
    importToken,
    // Nueva función para forzar carga de más tokens
    forceLoadMore: () => {
      if (tokens.length <= 11 && !allTokensLoaded) loadMoreTokens();
    }
  };
}; 

// Load user's balance tokens when wallet connects
// We keep this outside to avoid recreating functions; useEffect below handles lifecycle
