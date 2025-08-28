import React from 'react';
import { IconButton } from '@mui/material';
import { SwapVert } from '@mui/icons-material';

interface SwapButtonProps {
  onClick: () => void;
  onSwapTokens: () => void;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onClick, onSwapTokens }) => {
  const handleClick = () => {
    onSwapTokens();
    onClick();
  };

  return (
    <IconButton
      onClick={handleClick}
      aria-label="Swap tokens"
      sx={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: '50%',
        width: 40,
        height: 40,
        color: 'rgba(148, 163, 184, 0.9)',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 20,
        '&:hover': {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.5)',
          color: '#22c55e',
          transform: 'rotate(180deg)',
        },
      }}
    >
      <SwapVert sx={{ fontSize: 20 }} />
    </IconButton>
  );
};

export default SwapButton;
