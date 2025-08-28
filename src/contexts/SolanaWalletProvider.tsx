'use client'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { FC, ReactNode, useMemo, useCallback } from 'react'
import { clusterApiUrl } from '@solana/web3.js'

interface Props {
  children: ReactNode
}

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl(network)

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  const onError = useCallback((error: any) => {
    console.error('🚨 Wallet Provider Error:', error);
    
    // No mostrar errores al usuario para errores comunes
    if (error.message?.includes('User rejected') || 
        error.message?.includes('Connection rejected')) {
      return; // Usuario canceló, es normal
    }
    
    // Solo log errores inesperados
    if (error.name !== 'WalletNotSelectedError' && 
        error.name !== 'WalletConnectionError') {
      console.error('❌ Error inesperado de wallet:', error.message);
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets}
        autoConnect={false}
        onError={onError}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
