'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { TrendingDown, TrendingUp } from '@mui/icons-material';
import { TokenInfo } from '@/types/TokenInfo';
import { QuoteResponse } from '@/types/Token';

interface SwapSummaryProps {
  selectedRoute: QuoteResponse;
  sellingToken: string;
  buyingToken: string;
  tokensData: TokenInfo[];
  loadingQuote: boolean;
}

const SwapSummary: React.FC<SwapSummaryProps> = ({
  selectedRoute,
  sellingToken,
  buyingToken,
  tokensData,
  loadingQuote,
}) => {
  const fromToken = tokensData.find((t) => t.symbol === sellingToken);
  const toToken = tokensData.find((t) => t.symbol === buyingToken);

  if (loadingQuote) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            animation: 'jupiterPulse 1.5s ease-in-out infinite',
          }}
        />
        <Typography
          sx={{
            color: 'rgba(148, 163, 184, 0.8)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Finding best route...
        </Typography>
      </Box>
    );
  }

  if (!selectedRoute || !fromToken || !toToken) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
        }}
      >
        <Typography
          sx={{
            color: 'rgba(148, 163, 184, 0.6)',
            fontSize: '14px',
          }}
        >
          Enter amount to see route details
        </Typography>
      </Box>
    );
  }

  const fromDecimals = fromToken.decimals ?? 6;
  const toDecimals = toToken.decimals ?? 6;

  const rate = Number(selectedRoute.outAmount) / Math.pow(10, toDecimals) / 
               (Number(selectedRoute.inAmount) / Math.pow(10, fromDecimals));

  const priceImpactPct = selectedRoute.priceImpactPct ?? 0;
  const isHighImpact = Math.abs(priceImpactPct) > 1;

  // Get route info
  const routeInfo = selectedRoute.routePlan?.[0]?.swapInfo?.label || 'Jupiter';
  
  return (
    <Box
      sx={{
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderRadius: '12px',
        p: 2,
      }}
    >
      {/* Rate */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          1 {fromToken.symbol} ≈ {rate.toFixed(6)} {toToken.symbol}
        </Typography>

        <Chip
          label={routeInfo}
          size="small"
          sx={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
            fontSize: '11px',
            fontWeight: 600,
            height: 20,
          }}
        />
      </Box>

      {/* Price Impact */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            color: 'rgba(148, 163, 184, 0.8)',
            fontSize: '12px',
          }}
        >
          Price Impact
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {isHighImpact ? (
            <TrendingDown sx={{ fontSize: 14, color: '#ef4444' }} />
          ) : (
            <TrendingUp sx={{ fontSize: 14, color: '#22c55e' }} />
          )}
          <Typography
            sx={{
              color: isHighImpact ? '#ef4444' : '#22c55e',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {Math.abs(priceImpactPct).toFixed(2)}%
          </Typography>
        </Box>
      </Box>

      {/* Minimum received */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
        }}
      >
        <Typography
          sx={{
            color: 'rgba(148, 163, 184, 0.8)',
            fontSize: '12px',
          }}
        >
          Minimum Received
        </Typography>

        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {(Number(selectedRoute.outAmount) / Math.pow(10, toDecimals) * 0.995).toFixed(6)} {toToken.symbol}
        </Typography>
      </Box>
    </Box>
  );
};

export default SwapSummary;
