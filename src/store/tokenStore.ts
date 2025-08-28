import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Token } from '@/types/Token';
import { DEFAULT_TOKENS } from '@/utils/tokens';
import { TokenInfo } from '@/types/TokenInfo';

interface TokenState {
  tokens: Token[];
  selectedInputToken: string | null;
  selectedOutputToken: string | null;
  addToken: (token: Token) => void;
  removeToken: (address: string) => void;
  setSelectedToken: (side: 'input' | 'output', address: string) => void;
  updateToken: (address: string, updates: Partial<Token>) => void;
  getToken: (address: string) => Token | undefined;
}

interface TokenStore {
  tokens: TokenInfo[];
  selectedInputToken: string | null;
  selectedOutputToken: string | null;
  setTokens: (tokens: TokenInfo[]) => void;
  setSelectedToken: (type: 'input' | 'output', address: string) => void;
}

// Lista de tokens predeterminados
const defaultTokens: Token[] = [
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoURI: '/images/tokens/sol.png'
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/images/tokens/usdc.png'
  },
  // Agrega más tokens predeterminados aquí
];

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  selectedInputToken: null,
  selectedOutputToken: null,
  setTokens: (tokens) => set({ tokens }),
  setSelectedToken: (type, address) =>
    set(() => ({
      ...(type === 'input'
        ? { selectedInputToken: address }
        : { selectedOutputToken: address }),
    })),
}));

export const useTokenStateStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [...DEFAULT_TOKENS],
      selectedInputToken: null,
      selectedOutputToken: null,

      addToken: (token: Token) => {
        set((state) => {
          // Check if token already exists
          const exists = state.tokens.some((t) => t.address === token.address);
          if (exists) return state;

          return { tokens: [...state.tokens, token] };
        });
      },

      removeToken: (address: string) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.address !== address),
          selectedInputToken:
            state.selectedInputToken === address ? null : state.selectedInputToken,
          selectedOutputToken:
            state.selectedOutputToken === address ? null : state.selectedOutputToken,
        }));
      },

      setSelectedToken: (side: 'input' | 'output', address: string) =>
        set((state) => ({
          ...(side === 'input'
            ? { selectedInputToken: address }
            : { selectedOutputToken: address }),
        })),

      updateToken: (address: string, updates: Partial<Token>) => {
        set((state) => ({
          tokens: state.tokens.map((token) =>
            token.address === address ? { ...token, ...updates } : token
          ),
        }));
      },

      getToken: (address: string) => {
        return get().tokens.find((t) => t.address === address);
      },
    }),
    {
      name: 'token-storage',
      // Solo persistir los tokens personalizados y las selecciones
      partialize: (state) => ({
        tokens: state.tokens.filter(
          (token) => !defaultTokens.some((dt) => dt.address === token.address)
        ),
        selectedInputToken: state.selectedInputToken,
        selectedOutputToken: state.selectedOutputToken,
      }),
    }
  )
); 