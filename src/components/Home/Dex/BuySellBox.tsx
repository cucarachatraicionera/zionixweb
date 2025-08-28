'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  InputBase,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { TokenInfo } from '@/types/TokenInfo';
import useMediaQuery from '@mui/material/useMediaQuery';

interface BuySellBoxProps {
  type: 'buy' | 'sell';
  tokenLabel?: string;
  tokenIcon?: string;
  amount: string;
  balance?: number;
  tokensData?: TokenInfo[];
  showPercentButtons?: boolean;
  onTokenClick: () => void;
  onAmountChange: (value: string) => void;
  onSelectPercentage?: (percentage: number) => void;
}

const BuySellBox: React.FC<BuySellBoxProps> = ({
  type,
  tokenLabel = 'Select Token',
  tokenIcon,
  amount,
  balance,
  tokensData = [],
  onTokenClick,
  onAmountChange,
}) => {
  const isSell = type === 'sell';
  const isMobile = useMediaQuery('(max-width:600px)');

  // Find token for price
  const token = tokensData.find((t) => t.symbol === tokenLabel);
  const tokenPrice = token?.priceUsd;
  const usdValue = tokenPrice && amount ? (parseFloat(amount) * tokenPrice).toFixed(2) : '0.00';

  // Función para manejar el click en los botones de porcentaje
  const handlePercentClick = (percent: number) => {
    if (typeof balance === 'number' && balance > 0) {
      const value = (balance * percent).toFixed(6);
      onAmountChange(value.replace(/\.0+$/, ''));
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(22, 27, 34, 0.8)',
        border: '1px solid rgba(71, 85, 105, 0.4)',
        borderRadius: '16px',
        p: 2.5,
        mb:
          isSell && typeof balance === 'number' && balance > 0
            ? (isMobile ? 1.5 : 2)
            : 1,
        mt: isSell ? 0 : 1,
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'rgba(34, 197, 94, 0.4)',
          backgroundColor: 'rgba(22, 27, 34, 0.9)',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
        },
      }}
    >
      {/* Top row: Token selector and amount input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >
        {/* Token selector button */}
        <Button
          onClick={onTokenClick}
          sx={{
            backgroundColor: 'rgba(71, 85, 105, 0.6)',
            border: '1px solid rgba(100, 116, 139, 0.4)',
            borderRadius: '12px',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '16px',
            px: 2,
            py: 1,
            minWidth: 'auto',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(71, 85, 105, 0.8)',
              borderColor: 'rgba(34, 197, 94, 0.6)',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
            },
          }}
          startIcon={
            tokenIcon ? (
              <Avatar
                src={tokenIcon}
                sx={{ 
                  width: 24, 
                  height: 24,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/default-token-icon.svg';
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  borderRadius: '50%',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                }}
              />
            )
          }
          endIcon={<KeyboardArrowDown sx={{ color: 'rgba(148, 163, 184, 0.9)' }} />}
        >
          {tokenLabel}
        </Button>

        {/* Amount input */}
        <InputBase
          placeholder="0.00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          inputProps={{
            style: {
              textAlign: 'right',
              fontSize: '28px',
              fontWeight: 600,
              color: '#ffffff',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            },
            inputMode: 'decimal',
            pattern: '[0-9]*',
          }}
          sx={{
            flex: 1,
            ml: 2,
            '& input::placeholder': {
              color: 'rgba(148, 163, 184, 0.6)',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Bottom row: USD value and balance */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* USD value */}
        <Typography
          sx={{
            fontSize: '14px',
            color: 'rgba(148, 163, 184, 0.9)',
            fontWeight: 500,
          }}
        >
          {tokenPrice ? `~$${usdValue}` : ''}
        </Typography>

        {/* Balance (siempre que esté disponible) */}
        {typeof balance === 'number' && (
          <Typography
            sx={{
              fontSize: '14px',
              color: 'rgba(148, 163, 184, 0.9)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: '#22c55e',
              },
            }}
            onClick={() => onAmountChange(balance.toString())}
          >
            Balance: {balance.toFixed(4)} {tokenLabel}
          </Typography>
        )}
      </Box>

      {/* Botones de porcentaje solo para sell si hay balance */}
      {type === 'sell' && typeof balance === 'number' && balance > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
          }}
        >
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <Button
              key={p}
              variant="outlined"
              size="small"
              sx={{
                color: '#22c55e',
                borderColor: 'rgba(34, 197, 94, 0.4)',
                fontWeight: 600,
                minWidth: 0,
                px: 1.5,
                fontSize: '13px',
                '&:hover': {
                  borderColor: '#22c55e',
                  background: 'rgba(34, 197, 94, 0.08)',
                },
              }}
              onClick={() => handlePercentClick(p)}
            >
              {Math.round(p * 100)}%
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BuySellBox;
