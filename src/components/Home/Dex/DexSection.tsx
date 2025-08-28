'use client';

import dynamic from 'next/dynamic';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

// Cargar dinámicamente el componente JupiterSwap con SSR desactivado
const JupiterSwap = dynamic(() => import('./JupiterSwap'), { 
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '600px',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '24px',
        border: '1px solid rgba(30, 41, 59, 0.5)',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid #22c55e',
          borderTop: '3px solid transparent',
          animation: 'spin 1s linear infinite',
        }}
      />
    </Box>
  )
});

const DexSection = () => {
  return (
    <Box
      id="dex"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000510',
        background: `
          linear-gradient(135deg, #000510 0%, #0D1117 40%, #161B22 100%),
          radial-gradient(ellipse at 30% 20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Improved decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 }, position: 'relative', zIndex: 1 }}>
        {/* Mobile Title Section - Only visible on mobile */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 4, textAlign: 'center' }}>
          <motion.div
            initial={{ y: '-30px', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Brand badge */}
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
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  animation: 'jupiterPulse 1.5s ease-in-out infinite',
                }}
              />
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Powered by Zionix
              </Typography>
            </Box>
            
            {/* Main headline */}
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem' },
                fontWeight: 800,
                color: '#ffffff',
                mb: 3,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Swap{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  position: 'relative',
                }}
              >
                Solana tokens
              </Box>{' '}
              instantly
            </Typography>
            
            {/* Subtitle */}
            <Typography
              sx={{
                fontSize: { xs: '18px', sm: '20px' },
                color: 'rgba(203, 213, 225, 0.9)',
                mb: 4,
                lineHeight: 1.6,
                maxWidth: '520px',
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Experience lightning-fast token swaps on Solana with the best rates, lowest fees, and zero registration required.
            </Typography>
          </motion.div>
        </Box>

        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 4, lg: 6 },
            minHeight: { lg: 'calc(100vh - 200px)' }
          }}
        >
          
          {/* Left column - Enhanced text content */}
          <Box sx={{ 
            flex: 1,
            width: '100%', 
            maxWidth: { xs: '100%', lg: '50%' },
            display: 'flex',
            justifyContent: { xs: 'center', lg: 'flex-end' },
            pr: { lg: 3 },
            order: { xs: 2, lg: 1 },
          }}>
            <motion.div
              initial={{ x: '-50px', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ 
                textAlign: { xs: 'center', lg: 'left' }, 
                maxWidth: { xs: '100%', lg: '520px' },
              }}>
                
                {/* Desktop Title Section - Only visible on desktop */}
                <Box sx={{ display: { xs: 'none', lg: 'block' }, mb: 5 }}>
                  {/* Brand badge */}
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
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        animation: 'jupiterPulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#22c55e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Powered by Zionix
                    </Typography>
                  </Box>
                  
                  {/* Main headline */}
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { lg: '4.5rem', xl: '5rem' },
                      fontWeight: 800,
                      color: '#ffffff',
                      mb: 3,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Swap{' '}
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        position: 'relative',
                      }}
                    >
                      Solana tokens
                    </Box>{' '}
                    instantly
                  </Typography>
                  
                  {/* Subtitle */}
                  <Typography
                    sx={{
                      fontSize: { sm: '20px' },
                      color: 'rgba(203, 213, 225, 0.9)',
                      mb: 5,
                      lineHeight: 1.6,
                      maxWidth: '560px',
                      fontWeight: 400,
                    }}
                  >
                    Experience lightning-fast token swaps on Solana with the best rates, lowest fees, and zero registration required.
                  </Typography>
                </Box>

                {/* Enhanced Features Grid */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 4,
                      textAlign: { xs: 'center', lg: 'left' },
                    }}
                  >
                    Why Choose Our DEX:
                  </Typography>
                  
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      maxWidth: '560px',
                      mx: { xs: 'auto', lg: 0 },
                    }}
                  >
                    {[
                      {
                        title: 'Best Execution',
                        description: 'Jupiter aggregator finds optimal routes'
                      },
                      {
                        title: 'Ultra Low Fees',
                        description: 'Minimal slippage and transaction costs'
                      },
                      {
                        title: 'All Tokens',
                        description: 'Support for every major Solana token'
                      },
                      {
                        title: 'Real-time Data',
                        description: 'Live prices and instant updates'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(22, 27, 34, 0.4)',
                            border: '1px solid rgba(51, 65, 85, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(22, 27, 34, 0.6)',
                              borderColor: 'rgba(34, 197, 94, 0.4)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: '#22c55e',
                              flexShrink: 0,
                              mt: 0.5,
                              boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                            }}
                          />
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#ffffff',
                                mb: 0.5,
                              }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                color: 'rgba(148, 163, 184, 0.9)',
                                lineHeight: 1.4,
                              }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Box>

          {/* Right column - Swap interface */}
          <Box sx={{ 
            flex: 1,
            width: '100%', 
            maxWidth: { xs: '100%', lg: '50%' },
            display: 'flex',
            justifyContent: { xs: 'center', lg: 'flex-start' },
            pl: { lg: 3 },
            order: { xs: 1, lg: 2 },
          }}>
            <motion.div
              initial={{ x: '50px', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <JupiterSwap />
            </motion.div>
          </Box>
          
        </Box>
      </Container>
    </Box>
  );
};

export default DexSection;