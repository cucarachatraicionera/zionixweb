import { Token } from '@/types/Token';

// Default tokens that will always appear first
export const DEFAULT_TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  {
    symbol: 'USDT',
    name: 'USDT',
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
    icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logoURI: 'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
  }
];

// IPFS Gateways por orden de preferencia
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://cf-ipfs.com/ipfs/'
];

// Function to get image URL with fallback
export const getTokenImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-token-icon.svg';
  
  try {
    // Si ya es una URL HTTPS válida y está en los dominios permitidos, usarla
    if (url.startsWith('https://')) {
      // Si es una URL de GitHub raw, intentar usar JSDelivr
      if (url.includes('raw.githubusercontent.com')) {
        return url.replace(
          'https://raw.githubusercontent.com/solana-labs/token-list/main/',
          'https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/'
        );
      }
      return url;
    }

    // Handle IPFS URLs
    if (url.startsWith('ipfs://')) {
      const ipfsHash = url.replace('ipfs://', '');
      return `${IPFS_GATEWAYS[0]}${ipfsHash}`;
    }
    
    // Handle raw IPFS hashes
    if (url.match(/^Qm[1-9A-Za-z]{44}$/)) {
      return `${IPFS_GATEWAYS[0]}${url}`;
    }
    
    // Handle Arweave URLs
    if (url.includes('arweave.net')) {
      return url.replace('http://', 'https://');
    }

    // Si la URL no coincide con ningún patrón conocido
    console.warn(`Unrecognized token image URL format: ${url}`);
    return '/default-token-icon.svg';
  } catch (error) {
    console.error('Error processing token image URL:', error);
    return '/default-token-icon.svg';
  }
};

export const PRIORITY_TOKENS = ['SOL', 'USDC', 'USDT', 'JUP'];

// Function to sort tokens with default tokens first
export const sortTokens = <T extends { symbol: string }>(tokens: T[]): T[] => {
  if (!tokens || !Array.isArray(tokens)) return [] as T[];
  
  return tokens
    .filter(token => token && token.symbol)
    .sort((a, b) => {
      const aPriority = PRIORITY_TOKENS.indexOf(a.symbol.toUpperCase());
      const bPriority = PRIORITY_TOKENS.indexOf(b.symbol.toUpperCase());
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      return (a.symbol || '').localeCompare(b.symbol || '');
    });
}; 

// Function to preload and cache token images
export const preloadTokenImages = async (tokens: Token[]): Promise<void> => {
  const imageCache = new Map<string, string>();
  
  for (const token of tokens) {
    try {
      if (token.logoURI || token.icon) {
        const imageUrl = getTokenImageUrl(token.logoURI || token.icon);
        
        // Create a promise to preload the image
        const preloadPromise = new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            // Store in cache
            imageCache.set(token.address, imageUrl);
            localStorage.setItem(`tokenImage_${token.address}`, imageUrl);
            resolve(imageUrl);
          };
          img.onerror = () => {
            // Fallback to default
            const defaultUrl = '/default-token-icon.svg';
            imageCache.set(token.address, defaultUrl);
            localStorage.setItem(`tokenImage_${token.address}`, defaultUrl);
            resolve(defaultUrl);
          };
          img.src = imageUrl;
        });
        
        // Wait for image to load (with timeout)
        await Promise.race([
          preloadPromise,
          new Promise(resolve => setTimeout(() => resolve('/default-token-icon.svg'), 3000))
        ]);
      }
    } catch (error) {
      console.warn(`Failed to preload image for ${token.symbol}:`, error);
    }
  }
  
  console.log(`✅ [Image Cache] Preloaded ${imageCache.size} token images`);
};

// Function to get cached token image
export const getCachedTokenImage = (tokenAddress: string, fallbackUrl?: string): string => {
  try {
    // Check localStorage cache first
    const cached = localStorage.getItem(`tokenImage_${tokenAddress}`);
    if (cached) {
      return cached;
    }
    
    // Check memory cache
    const memoryCached = (window as any).__tokenImageCache?.[tokenAddress];
    if (memoryCached) {
      return memoryCached;
    }
    
    return fallbackUrl || '/default-token-icon.svg';
  } catch {
    return fallbackUrl || '/default-token-icon.svg';
  }
}; 