'use client'

import React, { FC } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { Instagram, Telegram } from '@mui/icons-material'
import Logo from '../Header/Logo'

const Footer: FC = () => {
  const handleInstagramClick = () => {
    window.open('https://instagram.com/zionix.ai', '_blank')
  }

  const handleTelegramClick = () => {
    window.open('https://t.me/zionixai', '_blank')
  }

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#000510',
        borderTop: '1px solid rgba(34, 197, 94, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-50%',
          right: '20%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          maxWidth: '1280px',
          margin: '0 auto',
          px: { xs: 3, sm: 4, lg: 5 },
          py: { xs: 6, md: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Main Footer Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 2 },
            mb: 4,
          }}
        >
          {/* Left Side - Logo */}
          <Box sx={{ flexShrink: 0, order: { xs: 1, md: 1 } }}>
            <Logo />
          </Box>

          {/* Center - Social Media */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              order: { xs: 2, md: 2 },
            }}
          >
            {/* Instagram Button */}
            <IconButton
              onClick={handleInstagramClick}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: 'rgba(225, 48, 108, 0.15)',
                border: '1px solid rgba(225, 48, 108, 0.4)',
                borderRadius: '16px',
                color: '#e1306c',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: 'rgba(225, 48, 108, 0.25)',
                  borderColor: 'rgba(225, 48, 108, 0.7)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 30px rgba(225, 48, 108, 0.4), 0 0 25px rgba(225, 48, 108, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(225, 48, 108, 0.4), transparent)',
                  animation: 'shimmerInstagram 3s infinite',
                },
                '@keyframes shimmerInstagram': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' },
                },
              }}
            >
              <Instagram sx={{ fontSize: 28 }} />
            </IconButton>

            {/* Telegram Button */}
            <IconButton
              onClick={handleTelegramClick}
              sx={{
                width: 56,
                height: 56,
                backgroundColor: 'rgba(0, 136, 204, 0.15)',
                border: '1px solid rgba(0, 136, 204, 0.4)',
                borderRadius: '16px',
                color: '#0088cc',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: 'rgba(0, 136, 204, 0.25)',
                  borderColor: 'rgba(0, 136, 204, 0.7)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 12px 30px rgba(0, 136, 204, 0.4), 0 0 25px rgba(0, 136, 204, 0.3)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(0, 136, 204, 0.4), transparent)',
                  animation: 'shimmerTelegram 3s infinite 1.5s',
                },
                '@keyframes shimmerTelegram': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' },
                },
              }}
            >
              <Telegram sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          {/* Right Side - Creator Credit */}
          <Box
            sx={{
              order: { xs: 3, md: 3 },
              textAlign: { xs: 'center', md: 'right' },
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                color: 'rgba(148, 163, 184, 0.8)',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Created by
            </Typography>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0ea5e9 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  filter: 'brightness(1.2)',
                },
              }}
            >
              ZionixDev
            </Typography>
          </Box>
        </Box>

        {/* Luminescent Divider */}
        <Box
          sx={{
            position: 'relative',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)',
            mb: 4,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              borderRadius: '2px',
              filter: 'blur(1px)',
              animation: 'dividerPulse 2s ease-in-out infinite',
            },
            '@keyframes dividerPulse': {
              '0%, 100%': { 
                opacity: 0.6,
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)',
              },
              '50%': { 
                opacity: 1,
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
              },
            },
          }}
        />

        {/* Bottom Row - Social Handles and Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 4 },
          }}
        >
          {/* Social Handles */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: { xs: 1, sm: 4 },
              order: { xs: 2, sm: 1 },
            }}
          >
            <Typography
              onClick={handleInstagramClick}
              sx={{
                fontSize: '14px',
                color: 'rgba(225, 48, 108, 0.9)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#e1306c',
                  transform: 'translateY(-1px)',
                  textShadow: '0 4px 8px rgba(225, 48, 108, 0.4)',
                },
              }}
            >
              @zionix.ai
            </Typography>
            <Typography
              onClick={handleTelegramClick}
              sx={{
                fontSize: '14px',
                color: 'rgba(0, 136, 204, 0.9)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: '#0088cc',
                  transform: 'translateY(-1px)',
                  textShadow: '0 4px 8px rgba(0, 136, 204, 0.4)',
                },
              }}
            >
              t.me/zionixai
            </Typography>
          </Box>

          {/* Copyright */}
          <Box sx={{ order: { xs: 1, sm: 2 } }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: 'rgba(148, 163, 184, 0.7)',
                fontWeight: 500,
                textAlign: { xs: 'center', sm: 'right' },
              }}
            >
              © 2025 Zionix. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
