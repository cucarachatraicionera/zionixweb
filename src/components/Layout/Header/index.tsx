'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, Button, Typography, IconButton } from '@mui/material'
import { Telegram, Close, Menu, ExitToApp } from '@mui/icons-material'
import { headerData } from '../Header/Navigation/menuData'
import Logo from './Logo'
import ConnectWalletModal from '@/components/Wallet/ConnectWalletModal'
import { useWalletContext, useWalletModal } from '@/contexts/walletContext'
import { useWallet } from '@solana/wallet-adapter-react'

const Header: React.FC = () => {
  const { disconnect } = useWallet()
  const walletCtx = useWalletContext()
  const { openWalletModal } = useWalletModal()

  const publicKey = walletCtx?.publicKey || null
  const connected = walletCtx?.connected || false

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)

  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => setSticky(window.scrollY >= 60)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }, [navbarOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  useEffect(() => {
    document.body.style.overflow = navbarOpen ? 'hidden' : ''
  }, [navbarOpen])

  const displayAddress = publicKey
    ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
    : 'Connect Wallet'

  const handleWalletClick = () => openWalletModal()

  const handleTradingBotClick = () => {
    window.open('https://t.me/Zionix888bot', '_blank')
  }

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          transition: 'all 0.3s ease',
          background: `
            linear-gradient(135deg, #000510 0%, #0D1117 40%, #161B22 100%),
            radial-gradient(ellipse at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
          `,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: sticky 
            ? '0 4px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' 
            : 'none',
        }}
      >
        <Box
          sx={{
            maxWidth: '1280px',
            margin: '0 auto',
            px: { xs: 2, sm: 3, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
          }}
        >
          {/* Logo */}
          <Box sx={{ flexShrink: 0 }}>
            <Logo />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 4 }}>
            {headerData.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(148, 163, 184, 0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#22c55e',
                      transform: 'translateY(-1px)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      width: '0%',
                      height: '2px',
                      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                      borderRadius: '1px',
                      transform: 'translateX(-50%)',
                      transition: 'width 0.3s ease',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            ))}
          </Box>

          {/* Desktop Right Side */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2 }}>
            {/* Trading Bot Button */}
            <Button
              onClick={handleTradingBotClick}
              startIcon={<Telegram />}
              sx={{
                backgroundColor: 'rgba(0, 136, 204, 0.15)',
                border: '1px solid rgba(0, 136, 204, 0.4)',
                borderRadius: '12px',
                color: '#0088cc',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 3,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 136, 204, 0.25)',
                  borderColor: 'rgba(0, 136, 204, 0.7)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 136, 204, 0.3)',
                },
              }}
            >
              Trading Bot
            </Button>

            {/* Wallet Button */}
            <Button
              onClick={handleWalletClick}
              sx={{
                backgroundColor: connected 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : 'rgba(71, 85, 105, 0.8)',
                border: connected 
                  ? '1px solid rgba(34, 197, 94, 0.5)' 
                  : '1px solid rgba(100, 116, 139, 0.5)',
                borderRadius: '12px',
                color: connected ? '#22c55e' : 'rgba(148, 163, 184, 0.9)',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 600,
                px: 3,
                py: 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: connected 
                  ? '0 0 20px rgba(34, 197, 94, 0.4), inset 0 0 20px rgba(34, 197, 94, 0.1)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: connected 
                    ? 'rgba(34, 197, 94, 0.25)' 
                    : 'rgba(71, 85, 105, 0.9)',
                  transform: 'translateY(-2px)',
                  boxShadow: connected 
                    ? '0 8px 25px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.3)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                },
                '&::before': connected ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
                  animation: 'shimmer 2s infinite',
                } : {},
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' },
                },
              }}
            >
              {displayAddress}
            </Button>

            {/* Disconnect Button */}
            {connected && (
              <IconButton
                onClick={disconnect}
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  color: '#ef4444',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
                  },
                }}
              >
                <ExitToApp sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setNavbarOpen(!navbarOpen)}
            sx={{
              display: { xs: 'flex', lg: 'none' },
              width: 40,
              height: 40,
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '10px',
              color: 'rgba(148, 163, 184, 0.9)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: 'rgba(34, 197, 94, 0.5)',
                color: '#22c55e',
              },
            }}
          >
            <Menu sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Mobile Overlay */}
        {navbarOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
            onClick={() => setNavbarOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <Box
          ref={mobileMenuRef}
          sx={{
            display: { xs: 'block', lg: 'none' },
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100vh',
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: 'rgba(13, 17, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.1)',
            transform: navbarOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            zIndex: 50,
            overflowY: 'auto',
          }}
        >
          {/* Mobile Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
            }}
          >
            <Logo />
            <IconButton
              onClick={() => setNavbarOpen(false)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '8px',
                color: 'rgba(148, 163, 184, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: '#ef4444',
                },
              }}
            >
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Mobile Navigation */}
          <Box sx={{ p: 3 }}>
            {headerData.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                style={{ textDecoration: 'none' }}
                onClick={() => setNavbarOpen(false)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 2,
                    px: 3,
                    mb: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(22, 27, 34, 0.6)',
                    border: '1px solid rgba(51, 65, 85, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(22, 27, 34, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 0.5)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'rgba(148, 163, 184, 0.9)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            ))}

            {/* Mobile Trading Bot Button */}
            <Button
              onClick={() => {
                handleTradingBotClick()
                setNavbarOpen(false)
              }}
              startIcon={<Telegram />}
              fullWidth
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: 'rgba(0, 136, 204, 0.15)',
                border: '1px solid rgba(0, 136, 204, 0.4)',
                borderRadius: '12px',
                color: '#0088cc',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                py: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 136, 204, 0.25)',
                },
              }}
            >
              Trading Bot
            </Button>

            {/* Mobile Wallet Button */}
            <Button
              onClick={() => {
                openWalletModal()
                setNavbarOpen(false)
              }}
              fullWidth
              sx={{
                backgroundColor: connected 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : 'rgba(71, 85, 105, 0.8)',
                border: connected 
                  ? '1px solid rgba(34, 197, 94, 0.5)' 
                  : '1px solid rgba(100, 116, 139, 0.5)',
                borderRadius: '12px',
                color: connected ? '#22c55e' : 'rgba(148, 163, 184, 0.9)',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                py: 2,
                mb: connected ? 2 : 0,
                boxShadow: connected 
                  ? '0 0 20px rgba(34, 197, 94, 0.3)' 
                  : 'none',
              }}
            >
              {displayAddress}
            </Button>

            {/* Mobile Disconnect Button */}
            {connected && (
              <Button
                onClick={() => {
                  disconnect()
                  setNavbarOpen(false)
                }}
                startIcon={<ExitToApp />}
                fullWidth
                sx={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  py: 2,
                }}
              >
                Disconnect
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <ConnectWalletModal />
    </>
  )
}

export default Header
