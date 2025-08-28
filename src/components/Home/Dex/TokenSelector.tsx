'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { TokenInfo } from '@/types/TokenInfo';
import TokenImage from '@/components/TokenImage';
import Skeleton from '@mui/material/Skeleton';

interface TokenSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (symbol: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tokensData: TokenInfo[];
  filteredTokens: TokenInfo[];
  loadingTokens: boolean;
  refreshTokens: (address: string) => Promise<boolean>;
  side: 'input' | 'output';
  loadMoreTokens: () => void;
  allTokensLoaded: boolean;
  forceLoadMore: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  open,
  onClose,
  onSelect,
  searchQuery,
  onSearchChange,
  tokensData,
  filteredTokens,
  loadingTokens,
  refreshTokens,
  side,
  loadMoreTokens,
  allTokensLoaded,
  forceLoadMore
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [clientDisplayTokens, setClientDisplayTokens] = useState<TokenInfo[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setClientDisplayTokens(filteredTokens);
    }
  }, [filteredTokens, side, tokensData, isClient]);

  useEffect(() => {
    if (open && tokensData.length <= 11 && forceLoadMore) {
      forceLoadMore();
    }
  }, [open, tokensData.length, forceLoadMore]);

  const handleImportToken = async () => {
    if (!searchQuery || searchQuery.length < 32) return;
    
    setIsImporting(true);
    try {
      const success = await refreshTokens(searchQuery);
      if (success) {
        // Clear search after successful import
        onSearchChange('');
      }
    } catch (error) {
      console.error('Failed to import token:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const isValidSolanaAddress = (address: string) => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  // Filtrar tokens duplicados por address
  const uniqueTokens = clientDisplayTokens.filter(
    (token, index, self) =>
      index === self.findIndex((t) => t.address === token.address)
  );

  const displayList = uniqueTokens.map((token) => {
    return (
      <ListItemButton
        key={token.address}
        onClick={() => {
          onSelect(token.symbol);
          onClose();
          onSearchChange('');
        }}
        sx={{
          borderRadius: '12px',
          mb: 0.5,
          mx: 1,
          py: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemAvatar sx={{ minWidth: 48 }}>
          <Box
            sx={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
              border: '2px solid rgba(71, 85, 105, 0.3)',
            }}
          >
            <TokenImage
              src={token.logoURI || token.icon || '/default-token-icon.svg'}
              alt={token.symbol}
              width={36}
              height={36}
            />
          </Box>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography
              sx={{ 
                fontSize: '16px', 
                fontWeight: 600,
                color: '#ffffff',
                transition: 'color 0.2s ease',
              }}
            >
              {token.symbol}
            </Typography>
          }
          secondary={
            <Typography
              sx={{ 
                fontSize: '13px', 
                color: 'rgba(148, 163, 184, 0.7)',
                mt: 0.5,
              }}
            >
              {token.name}
            </Typography>
          }
        />

        <Box sx={{ textAlign: 'right' }}>
          {token.priceUsd && (
            <Typography
              sx={{
                fontSize: '14px',
                color: '#ffffff',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              ${token.priceUsd.toFixed(4)}
            </Typography>
          )}
          {/* Show balance if available */}
          {token.balance && (
            <Typography
              sx={{
                fontSize: '12px',
                color: 'rgba(34, 197, 94, 0.8)',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {parseFloat(token.balance).toFixed(6)}
            </Typography>
          )}
          <Chip
            label="✓"
            size="small"
            sx={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              fontSize: '10px',
              height: 16,
              minWidth: 16,
              '& .MuiChip-label': {
                px: 0.5,
              },
            }}
          />
        </Box>
      </ListItemButton>
    );
  });

  // Skeleton loader
  const skeletonList = Array.from({ length: 10 }).map((_, i) => (
    <ListItemButton key={i} disabled>
      <ListItemAvatar sx={{ minWidth: 48 }}>
        <Skeleton variant="circular" width={36} height={36} />
      </ListItemAvatar>
      <ListItemText
        primary={<Skeleton width={60} />}
        secondary={<Skeleton width={100} />}
      />
      <Box sx={{ textAlign: 'right' }}>
        <Skeleton width={40} />
      </Box>
    </ListItemButton>
  ));

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && !allTokensLoaded) {
      loadMoreTokens && loadMoreTokens();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          maxHeight: '80vh',
          m: 2,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3, 
            pb: 2 
          }}
        >
          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            Select Token
          </Typography>
          
          <IconButton
            onClick={onClose}
            sx={{
              color: 'rgba(148, 163, 184, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(51, 65, 85, 0.3)',
                color: '#ffffff',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Search input */}
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by token or paste address"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(148, 163, 184, 0.6)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                '& fieldset': {
                  borderColor: 'rgba(51, 65, 85, 0.6)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(34, 197, 94, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#22c55e',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: '#ffffff',
                fontSize: '16px',
                py: 1.5,
                '&::placeholder': {
                  color: 'rgba(148, 163, 184, 0.6)',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Import token suggestion */}
        {searchQuery && isValidSolanaAddress(searchQuery) && clientDisplayTokens.length === 0 && !loadingTokens && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Box
              onClick={handleImportToken}
              sx={{
                p: 2,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isImporting ? (
                  <CircularProgress size={20} sx={{ color: '#22c55e' }} />
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#000',
                    }}
                  >
                    +
                  </Box>
                )}
                <Box>
                  <Typography
                    sx={{
                      color: '#22c55e',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Import Token
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(148, 163, 184, 0.8)',
                      fontSize: '12px',
                    }}
                  >
                    {searchQuery.slice(0, 8)}...{searchQuery.slice(-8)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Token list */}
        <Box sx={{ px: 2, pb: 3 }}>
          {loadingTokens ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 6,
                gap: 2,
              }}
            >
              <CircularProgress 
                size={24} 
                sx={{ color: '#22c55e' }} 
              />
              <Typography
                sx={{
                  color: 'rgba(148, 163, 184, 0.8)',
                  fontSize: '14px',
                }}
              >
                Loading tokens...
              </Typography>
            </Box>
          ) : clientDisplayTokens.length === 0 && !isValidSolanaAddress(searchQuery) ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography
                sx={{
                  color: 'rgba(148, 163, 184, 0.6)',
                  fontSize: '16px',
                  mb: 1,
                }}
              >
                No tokens found
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(148, 163, 184, 0.5)',
                  fontSize: '13px',
                }}
              >
                Try a different search term
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                maxHeight: 400,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(34, 197, 94, 0.3)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(34, 197, 94, 0.5)',
                },
              }}
              onScroll={handleScroll}
            >
              {loadingTokens ? skeletonList : displayList}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
