'use client';

import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Cancel, Close } from '@mui/icons-material';

interface SwapProcessingDialogProps {
  open: boolean;
  onClose: () => void;
  swapping: boolean;
  swapProcessMessage: string;
}

const SwapProcessingDialog: React.FC<SwapProcessingDialogProps> = ({
  open,
  onClose,
  swapping,
  swapProcessMessage
}) => {
  const isError = swapProcessMessage.includes('❌');
  const isSuccess = swapProcessMessage.includes('✅') && !swapping;

  return (
    <Modal
      open={open}
      onClose={() => !swapping && onClose()}
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
          border: isError 
            ? '1px solid rgba(239, 68, 68, 0.3)' 
            : isSuccess 
            ? '1px solid rgba(34, 197, 94, 0.3)' 
            : '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '24px',
          p: 4,
          outline: 'none',
          boxShadow: isError 
            ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)'
            : isSuccess 
            ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 197, 94, 0.1)'
            : '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.1)',
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
        {/* Close button - only visible when not swapping */}
        {!swapping && (
          <Button
            onClick={onClose}
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
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                color: '#ef4444',
                transform: 'scale(1.1)',
              },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </Button>
        )}

        {/* Header with status indicator */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Status badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              backgroundColor: isError 
                ? 'rgba(239, 68, 68, 0.12)' 
                : isSuccess 
                ? 'rgba(34, 197, 94, 0.12)' 
                : 'rgba(59, 130, 246, 0.12)',
              border: isError 
                ? '1px solid rgba(239, 68, 68, 0.3)' 
                : isSuccess 
                ? '1px solid rgba(34, 197, 94, 0.3)' 
                : '1px solid rgba(59, 130, 246, 0.3)',
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
                backgroundColor: isError 
                  ? '#ef4444' 
                  : isSuccess 
                  ? '#22c55e' 
                  : '#3b82f6',
                animation: swapping ? 'pulse 1.5s ease-in-out infinite' : 'none',
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
                color: isError 
                  ? '#ef4444' 
                  : isSuccess 
                  ? '#22c55e' 
                  : '#3b82f6',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {swapping 
                ? 'Processing' 
                : isError 
                ? 'Failed' 
                : 'Completed'}
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
            {swapping
              ? 'Processing Swap'
              : isError
              ? 'Transaction Failed'
              : 'Swap Successful'}
          </Typography>
        </Box>

        {/* Status icon and animation */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {swapping ? (
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress
                size={60}
                thickness={3}
                sx={{
                  color: '#3b82f6',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  animation: 'innerPulse 1.5s ease-in-out infinite',
                  '@keyframes innerPulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.5)', opacity: 0.7 },
                  },
                }}
              />
            </Box>
          ) : isError ? (
            <Cancel 
              sx={{ 
                fontSize: 60, 
                color: '#ef4444',
                animation: 'errorShake 0.5s ease-in-out',
                '@keyframes errorShake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '25%': { transform: 'translateX(-5px)' },
                  '75%': { transform: 'translateX(5px)' },
                },
              }} 
            />
          ) : (
            <CheckCircle 
              sx={{ 
                fontSize: 60, 
                color: '#22c55e',
                animation: 'successScale 0.5s ease-in-out',
                '@keyframes successScale': {
                  '0%': { transform: 'scale(0)', opacity: 0 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                  '100%': { transform: 'scale(1)', opacity: 1 },
                },
              }} 
            />
          )}
        </Box>

        {/* Message */}
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '16px',
            color: 'rgba(203, 213, 225, 0.9)',
            lineHeight: 1.5,
            mb: 4,
            '& a': {
              color: '#22c55e',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: swapProcessMessage }}
        />

        {/* Action button */}
        {!swapping && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={onClose}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                backgroundColor: isError 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : 'rgba(34, 197, 94, 0.1)',
                border: isError 
                  ? '1px solid rgba(239, 68, 68, 0.4)' 
                  : '1px solid rgba(34, 197, 94, 0.4)',
                color: isError ? '#ef4444' : '#22c55e',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isError 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : 'rgba(34, 197, 94, 0.2)',
                  transform: 'translateY(-1px)',
                  boxShadow: isError 
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                    : '0 4px 12px rgba(34, 197, 94, 0.3)',
                },
              }}
            >
              {isError ? 'Try Again' : 'Close'}
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default SwapProcessingDialog;
