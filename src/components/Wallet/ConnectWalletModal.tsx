'use client'

import { useEffect, useState } from 'react'
import { Box, Typography, Button, Modal, CircularProgress } from '@mui/material'
import { Close } from '@mui/icons-material'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletContext, useWalletModal } from '@/contexts/walletContext'

const ConnectWalletModal: React.FC = () => {
  const { connected, wallets, select, connect } = useWalletContext()
  const [connecting, setConnecting] = useState<string | null>(null)
  const { walletModalOpen, closeWalletModal } = useWalletModal()

  // Close modal if already connected
  useEffect(() => {
    if (connected) {
      setConnecting(null) // Reset connecting state
      closeWalletModal()
    }
  }, [connected, closeWalletModal])

  const handleConnect = async (walletName: string) => {
    if (connecting) return;

    try {
      setConnecting(walletName);

      // Buscar el wallet específico
      const wallet = wallets.find((w) => w.adapter.name === walletName);
      if (!wallet) {
        console.error(`❌ Wallet ${walletName} no está disponible`);
        return;
      }

      // Si ya está conectado y seleccionado, cerrar modal
      if (connected && wallet.adapter.connected) {
        closeWalletModal();
        setConnecting(null);
        return;
      }

      // Seleccionar el wallet
      select(wallet.adapter.name);

      // Esperar a que el wallet esté seleccionado (polling)
      let retries = 10;
      while (retries > 0 && !wallet.adapter.connected) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        retries--;
      }

      // Si después de esperar no está conectado, intentar conectar
      if (!wallet.adapter.connected) {
        await connect();
      }

      // Si se conectó correctamente, cerrar modal
      if (wallet.adapter.connected) {
        closeWalletModal();
      }

      setConnecting(null);
    } catch (error: any) {
      console.error(`💥 Error conectando wallet ${walletName}:`, error);
      
      // Manejo específico de diferentes tipos de errores
      if (error.name === 'WalletNotSelectedError') {
        console.warn('⚠️ El wallet no se seleccionó correctamente. Intenta de nuevo.');
      } else if (error.name === 'WalletConnectionError') {
        console.warn('⚠️ Error de conexión del wallet. Verifica que esté desbloqueado.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        console.warn('⚠️ El usuario canceló la conexión.');
      } else if (error.message?.includes('not installed')) {
        console.warn(`⚠️ ${walletName} no está instalado. Por favor instálalo primero.`);
      } else {
        console.error('❌ Error inesperado:', error.message);
      }

      setConnecting(null);
    }
  };

  if (!walletModalOpen) return null

  return (
    <Modal
      open={walletModalOpen}
      onClose={closeWalletModal}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          mx: 2,
          backgroundColor: 'rgba(13, 17, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '24px',
          p: 4,
          outline: 'none',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.1)',
          animation: 'modalSlideIn 0.3s ease-out',
          '@keyframes modalSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9) translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }}
      >
        {/* Close button */}
        <Button
          onClick={closeWalletModal}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 'auto',
            width: 32,
            height: 32,
            borderRadius: '50%',
            color: 'rgba(148, 163, 184, 0.9)',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderColor: 'rgba(34, 197, 94, 0.5)',
              color: '#22c55e',
              transform: 'scale(1.1)',
            },
          }}
        >
          <Close sx={{ fontSize: 18 }} />
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4, mt: 1 }}>
          {/* Pulsing indicator */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '50px',
              px: 3,
              py: 1,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#22c55e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Wallet Required
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Connect Your Wallet
          </Typography>
          
          <Typography
            sx={{
              fontSize: '16px',
              color: 'rgba(148, 163, 184, 0.9)',
              lineHeight: 1.5,
            }}
          >
            Choose a wallet to continue with your swap on Solana
          </Typography>
        </Box>

        {/* Wallet options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            onClick={() => handleConnect('Phantom')}
            disabled={connecting !== null}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 3,
              width: '100%',
              p: 3,
              backgroundColor: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              borderRadius: '16px',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              opacity: connecting && connecting !== 'Phantom' ? 0.5 : 1,
              '&:hover': {
                backgroundColor: 'rgba(22, 27, 34, 0.9)',
                borderColor: 'rgba(34, 197, 94, 0.6)',
                transform: connecting ? 'none' : 'translateY(-2px)',
                boxShadow: connecting ? 'none' : '0 8px 25px rgba(34, 197, 94, 0.15)',
              },
              '&:disabled': {
                color: 'rgba(148, 163, 184, 0.6)',
                cursor: 'not-allowed',
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
                border: '1px solid rgba(138, 43, 226, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {connecting === 'Phantom' ? (
                <CircularProgress size={16} sx={{ color: '#8a2be2' }} />
              ) : (
                <Image src='/wallets/phantom.svg' alt='Phantom Wallet' width={20} height={20} />
              )}
            </Box>
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                {connecting === 'Phantom' ? 'Connecting...' : 'Phantom'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.8)' }}>
                {connecting === 'Phantom' ? 'Please check your wallet' : 'Most popular Solana wallet'}
              </Typography>
            </Box>
          </Button>

          <Button
            onClick={() => handleConnect('Solflare')}
            disabled={connecting !== null}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 3,
              width: '100%',
              p: 3,
              backgroundColor: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              borderRadius: '16px',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              opacity: connecting && connecting !== 'Solflare' ? 0.5 : 1,
              '&:hover': {
                backgroundColor: 'rgba(22, 27, 34, 0.9)',
                borderColor: 'rgba(34, 197, 94, 0.6)',
                transform: connecting ? 'none' : 'translateY(-2px)',
                boxShadow: connecting ? 'none' : '0 8px 25px rgba(34, 197, 94, 0.15)',
              },
              '&:disabled': {
                color: 'rgba(148, 163, 184, 0.6)',
                cursor: 'not-allowed',
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                border: '1px solid rgba(255, 140, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {connecting === 'Solflare' ? (
                <CircularProgress size={16} sx={{ color: '#ff8c00' }} />
              ) : (
                <Image src='/wallets/solflare.svg' alt='Solflare Wallet' width={20} height={20} />
              )}
            </Box>
            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                {connecting === 'Solflare' ? 'Connecting...' : 'Solflare'}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.8)' }}>
                {connecting === 'Solflare' ? 'Please check your wallet' : 'Advanced features & security'}
              </Typography>
            </Box>
          </Button>
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(148, 163, 184, 0.7)',
            mt: 4,
            lineHeight: 1.4,
          }}
        >
          Your wallet will be used to interact with Solana blockchain.
          <br />
          We never store your private keys.
        </Typography>
      </Box>
    </Modal>
  )
}

export default ConnectWalletModal
