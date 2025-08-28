'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useWalletContext } from '@/contexts/walletContext';
import BuySellBox from './BuySellBox';
import SwapButton from './SwapButton';
import SwapSummary from './SwapSummary';
import { TokenInfo } from '@/types/TokenInfo';
import { QuoteResponse } from '@/types/Token';

interface SwapPanelProps {
  swapMode: 'auto' | 'manual';
  onSwapModeChange: (
    event: React.MouseEvent<HTMLElement>,
    value: 'auto' | 'manual' | null
  ) => void;
  sellingToken: string;
  buyingToken: string;
  sellAmount: string;
  buyAmount: string;
  onSellingAmountChange: (val: string) => void;
  onBuyingAmountChange: (val: string) => void;
  onTokenClick: (type: 'buy' | 'sell') => void;
  onSwapClick: () => void;
  onSwapTokens: () => void;
  tokensData: TokenInfo[];
  selectedRoute: QuoteResponse | null;
  loadingQuote: boolean;
  balanceError: string | null;
  inputTokenBalance: number | null;
  outputTokenBalance: number | null;
}

const SwapPanel: React.FC<SwapPanelProps> = ({
  sellingToken,
  buyingToken,
  sellAmount,
  buyAmount,
  onSellingAmountChange,
  onBuyingAmountChange,
  onTokenClick,
  onSwapClick,
  onSwapTokens,
  tokensData,
  selectedRoute,
  loadingQuote,
  balanceError,
  inputTokenBalance,
  outputTokenBalance
}) => {
  const { connected } = useWalletContext();
  const sellingTokenData = tokensData.find((t) => t.symbol === sellingToken);
  const buyingTokenData = tokensData.find((t) => t.symbol === buyingToken);

  // Determine button state and text
  const getButtonState = () => {
    if (!connected) {
      return {
        text: 'Connect Wallet',
        disabled: false,
        canSwap: false
      };
    }
    
    if (balanceError) {
      return {
        text: 'Insufficient Balance',
        disabled: true,
        canSwap: false
      };
    }
    
    if (!selectedRoute) {
      return {
        text: sellAmount ? 'Enter amount' : 'Enter amount',
        disabled: true,
        canSwap: false
      };
    }
    
    return {
      text: 'Swap',
      disabled: false,
      canSwap: true
    };
  };

  const buttonState = getButtonState();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '420px',
        mx: 'auto',
        backgroundColor: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header with Instant tab only */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
          px: 3,
          py: 2,
          backgroundColor: 'rgba(22, 27, 34, 0.6)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: connected ? '#22c55e' : 'rgba(148, 163, 184, 0.6)',
              animation: connected ? 'jupiterPulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: connected ? '#22c55e' : 'rgba(148, 163, 184, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {connected ? 'Instant' : 'Wallet Required'}
          </Typography>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ p: 3, backgroundColor: 'rgba(13, 17, 23, 0.4)' }}>
        {/* Ultra V2 badge */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 3
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: connected ? '#22c55e' : 'rgba(148, 163, 184, 0.7)',
              backgroundColor: connected 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(71, 85, 105, 0.15)',
              border: connected 
                ? '1px solid rgba(34, 197, 94, 0.3)' 
                : '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: '12px',
              px: 2,
              py: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {connected ? '⚡ Ultra V2' : '🔒 Connect First'}
          </Typography>
        </Box>

        {/* Swap inputs container */}
        <Box sx={{ position: 'relative', opacity: connected ? 1 : 0.6 }}>
          {/* Selling input */}
          <BuySellBox
            type="sell"
            tokenLabel={sellingToken}
            tokenIcon={sellingTokenData?.logoURI}
            amount={sellAmount}
            onAmountChange={onSellingAmountChange}
            onTokenClick={() => onTokenClick('sell')}
            tokensData={tokensData}
            balance={inputTokenBalance ?? undefined}
          />

          {/* Swap button - positioned between inputs */}
          <Box
            sx={{
              position: 'absolute',
              top: '56%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'rgba(13, 17, 23, 0.95)',
              borderRadius: '50%',
              p: 0.5,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            <SwapButton onClick={() => {}} onSwapTokens={onSwapTokens} />
          </Box>

          {/* Buying input */}
          <BuySellBox
            type="buy"
            tokenLabel={buyingToken}
            tokenIcon={buyingTokenData?.logoURI}
            amount={buyAmount}
            onAmountChange={onBuyingAmountChange}
            onTokenClick={() => onTokenClick('buy')}
            tokensData={tokensData}
            balance={outputTokenBalance ?? undefined}
          />
        </Box>

        {/* Swap Summary */}
        {selectedRoute && connected && (
          <Box sx={{ mt: 2 }}>
            <SwapSummary
              selectedRoute={selectedRoute}
              sellingToken={sellingToken}
              buyingToken={buyingToken}
              tokensData={tokensData}
              loadingQuote={loadingQuote}
            />
          </Box>
        )}

        {/* Connect/Swap button */}
        <Box sx={{ mt: 3 }}>
          <button
            onClick={onSwapClick}
            disabled={buttonState.disabled}
            className="w-full py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: buttonState.canSwap 
                ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                : !connected 
                ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'rgba(71, 85, 105, 0.6)',
              color: buttonState.canSwap || !connected ? '#ffffff' : 'rgba(148, 163, 184, 0.9)',
              boxShadow: buttonState.canSwap 
                ? '0 4px 20px rgba(34, 197, 94, 0.4)' 
                : !connected 
                ? '0 4px 20px rgba(59, 130, 246, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.2)',
              border: buttonState.canSwap || !connected ? 'none' : '1px solid rgba(71, 85, 105, 0.3)',
            }}
          >
            {buttonState.text}
          </button>
        </Box>

        {/* Wallet status indicator */}
        {!connected && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '12px',
                color: 'rgba(148, 163, 184, 0.7)',
                fontStyle: 'italic',
              }}
            >
              Connect your wallet to start trading
            </Typography>
          </Box>
        )}

        {/* Balance Error Message */}
        {balanceError && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                p: 2,
              }}
            >
              <Typography
                sx={{
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                {balanceError}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SwapPanel;
