'use client'

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { SolanaWalletProvider } from './SolanaWalletProvider'
import { VersionedTransaction } from '@solana/web3.js'
import { Wallet } from '@solana/wallet-adapter-react'
import { WalletName } from '@solana/wallet-adapter-base'

interface WalletContextType {
  publicKey: string | null
  connected: boolean
  connecting: boolean
  signTransaction?: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  wallets: Wallet[]
  select: (walletName: WalletName) => void
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

interface WalletModalContextType {
  walletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
}

const WalletModalContext = createContext<WalletModalContextType | null>(null);

export const WalletProviderWrapper = ({ children }: { children: ReactNode }) => (
  <SolanaWalletProvider>
    <WalletInnerProvider>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletInnerProvider>
  </SolanaWalletProvider>
)

const WalletInnerProvider = ({ children }: { children: ReactNode }) => {
  const { 
    publicKey, 
    connected, 
    signTransaction, 
    connecting,
    wallets,
    select,
    connect,
    disconnect
  } = useWallet()

  const [_, setForceUpdate] = useState(0);
  useEffect(() => {
    setForceUpdate((n) => n + 1);
  }, [publicKey, connected, connecting, signTransaction]);

  const value = useMemo<WalletContextType>(() => ({
    publicKey: publicKey ? publicKey.toBase58() : null,
    connected: !!connected,
    connecting,
    signTransaction,
    wallets,
    select,
    connect,
    disconnect
  }), [publicKey, connected, connecting, signTransaction, wallets, select, connect, disconnect])

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProviderWrapper')
  }
  return context
}

export const WalletModalProvider = ({ children }: { children: ReactNode }) => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const openWalletModal = useCallback(() => setWalletModalOpen(true), []);
  const closeWalletModal = useCallback(() => setWalletModalOpen(false), []);

  const value = useMemo(() => ({ walletModalOpen, openWalletModal, closeWalletModal }), [walletModalOpen, openWalletModal, closeWalletModal]);

  return (
    <WalletModalContext.Provider value={value}>
      {children}
    </WalletModalContext.Provider>
  );
};

export const useWalletModal = () => {
  const ctx = useContext(WalletModalContext);
  if (!ctx) throw new Error('useWalletModal must be used within a WalletModalProvider');
  return ctx;
};
