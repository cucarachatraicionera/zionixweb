'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { fetchTokenMetadata } from '@/utils/fetchTokenMetadata';

interface AddTokenModalProps {
  open: boolean;
  onClose: () => void;
  onAddSuccess?: () => void;
  newTokenAddress: string;
  setNewTokenAddress: (address: string) => void;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({
  open,
  onClose,
  onAddSuccess,
  newTokenAddress,
  setNewTokenAddress,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTokenAddress) return;

    setLoading(true);
    setFeedback(null);

    try {
      const metadata = await fetchTokenMetadata(newTokenAddress);

      console.log('📦 Token Metadata:', metadata);

      if (!metadata || !metadata.symbol || !metadata.name) {
        setFeedback('❌ Token not found or metadata is invalid.');
        return;
      }

      setFeedback('✅ Token successfully added.');

      if (onAddSuccess) await onAddSuccess();

      setTimeout(() => {
        setNewTokenAddress('');
        setFeedback(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('[AddTokenModal] Error:', error);
      setFeedback(`❌ Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: 'rgba(17,17,17,0.95)',
          color: '#fff',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <DialogTitle className="font-space-grotesk text-[#14f195] text-xl">
        Add Custom Token
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Typography variant="body2" className="font-space-grotesk text-gray-400 mb-4">
          Paste the mint address of the token you want to add:
        </Typography>

        <TextField
          fullWidth
          autoFocus
          placeholder="e.g. So11111111111111111111111111111111111111112"
          value={newTokenAddress}
          onChange={(e) => setNewTokenAddress(e.target.value)}
          variant="outlined"
          disabled={loading}
          sx={{
            input: {
              color: '#fff',
              padding: '10px',
              fontFamily: 'monospace',
            },
            fieldset: { borderColor: '#333' },
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
          }}
        />

        {feedback && (
          <Typography
            variant="body2"
            className="font-space-grotesk"
            sx={{
              mt: 2,
              color: feedback.startsWith('✅') ? '#14f195' : '#ff5252',
              fontFamily: 'monospace',
            }}
          >
            {feedback}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#14f195',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleAdd}
          disabled={!newTokenAddress || loading}
          sx={{
            backgroundColor: '#14f195',
            color: '#111',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            paddingX: 3,
            '&:hover': {
              backgroundColor: '#10d191',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: '#111' }} />
          ) : (
            'Add Token'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTokenModal;
