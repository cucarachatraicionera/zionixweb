'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import SwapPanel from './SwapPanel';
import TokenSelector from './TokenSelector';
import SwapProcessingDialog from './SwapProcessingDialog';
import ConnectWalletModal from '@/components/Wallet/ConnectWalletModal';
import { useTokenList } from '@/hooks/useTokenList';
import { getQuote, buildSwap, executeSwap } from '@/hooks/useJupiterSwap';
import { useWalletContext, useWalletModal } from '@/contexts/walletContext';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { QuoteResponse } from '@/types/Token';
import { Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { verifyOrCreateFeeAccount } from '@/utils/feeUtils';

// Helper function to get token balance (works for both SPL and Token-2022)
const getTokenBalance = async (connection: Connection, walletAddress: string, tokenMint: string, tokenSymbol: string): Promise<number> => {
  try {
    // First try SPL standard
    try {
      const ata = await getAssociatedTokenAddress(new PublicKey(tokenMint), new PublicKey(walletAddress));
      const tokenBalance = await connection.getTokenAccountBalance(ata);
      return Number(tokenBalance.value.amount) / Math.pow(10, tokenBalance.value.decimals);
    } catch (err) {
      // If SPL fails, try Token-2022
      if (err instanceof Error && err.message.includes('could not find account')) {
        console.log(`🔍 [getTokenBalance] SPL ATA no encontrada para ${tokenSymbol}, intentando Token-2022...`);
        
        // Get all token accounts for this mint
        const tokenAccounts = await connection.getTokenAccountsByOwner(
          new PublicKey(walletAddress),
          { mint: new PublicKey(tokenMint) }
        );
        
        if (tokenAccounts.value.length > 0) {
          // Get the first account info
          const accountInfo = await connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey);
          if (accountInfo.value) {
            const parsedData = accountInfo.value.data as any;
            if (parsedData.parsed) {
              const balance = parsedData.parsed.info.tokenAmount.uiAmount || 0;
              console.log(`✅ [getTokenBalance] Token-2022 ${tokenSymbol} encontrado: ${balance}`);
              return balance;
            }
          }
        }
      }
      throw err;
    }
  } catch (err) {
    console.error(`❌ [getTokenBalance] Error obteniendo balance para ${tokenSymbol}:`, err);
    return 0;
  }
};

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC!;
const connection = new Connection(RPC_URL, 'confirmed');

const JupiterSwap: React.FC = () => {
  const { connected, publicKey, signTransaction } = useWalletContext();
  const { openWalletModal } = useWalletModal();
  // Token list state
  const {
    tokens: tokensData,
    loading: loadingTokens,
    loadMoreTokens,
    allTokensLoaded,
    importToken,
    forceLoadMore
  } = useTokenList();

  // Swap state
  const [sellingToken, setSellingToken] = useState('USDT');
  const [buyingToken, setBuyingToken] = useState('SOL');
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // UI state
  const [swapping, setSwapping] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapMode, setSwapMode] = useState<'auto' | 'manual'>('auto');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'selling' | 'buying' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [inputTokenBalance, setInputTokenBalance] = useState<number | null>(null);
  const [outputTokenBalance, setOutputTokenBalance] = useState<number | null>(null);

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokensData;
    const query = searchQuery.toLowerCase();
    return tokensData.filter(token => 
      token.symbol.toLowerCase().includes(query) || 
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokensData, searchQuery]);

  // Auto-load USDT token data when component mounts
  useEffect(() => {
    if (tokensData.length > 0 && !loadingTokens) {
      // Find USDT token
      const usdtToken = tokensData.find(token => token.symbol === 'USDT');
      if (usdtToken) {
        console.log('✅ [JupiterSwap] USDT token loaded:', usdtToken);
        // Set initial sell amount to 0 but ensure token is properly loaded
        setSellAmount('0');
      }
    }
  }, [tokensData, loadingTokens]);

  // Auto-load SOL token data when component mounts
  useEffect(() => {
    if (tokensData.length > 0 && !loadingTokens) {
      // Find SOL token
      const solToken = tokensData.find(token => token.symbol === 'SOL');
      if (solToken) {
        console.log('✅ [JupiterSwap] SOL token loaded:', solToken);
        // Set initial buy amount to 0 but ensure token is properly loaded
        setBuyAmount('0');
      }
    }
  }, [tokensData, loadingTokens]);

  // Quote fetching
  useEffect(() => {
    const fetchQuote = async () => {
      const from = tokensData.find(t => t.symbol === sellingToken);
      const to = tokensData.find(t => t.symbol === buyingToken);
      const parsedAmount = parseFloat(sellAmount);

      if (!from?.address || !to?.address || isNaN(parsedAmount) || parsedAmount <= 0) {
        setSelectedRoute(null);
        setBuyAmount('');
        return;
      }

      try {
        setLoadingQuote(true);
        const fromDecimals = from.decimals ?? 6;
        const toDecimals = to.decimals ?? 6;
        const amount = Math.floor(parsedAmount * Math.pow(10, fromDecimals));

        const quote = await getQuote({
          inputMint: from.address,
          outputMint: to.address,
          amount
        });

        if (quote?.outAmount) {
          setSelectedRoute(quote);
          const outAmt = parseFloat(quote.outAmount) / Math.pow(10, toDecimals);
          setBuyAmount(outAmt.toFixed(6));
        } else {
          setSelectedRoute(null);
          setBuyAmount('');
        }
      } catch (err) {
        console.error('[Quote Error]', err);
        setSelectedRoute(null);
        setBuyAmount('');
      } finally {
        setLoadingQuote(false);
      }
    };

    const delay = setTimeout(() => {
      if (sellAmount && tokensData.length > 0) {
        fetchQuote();
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [sellAmount, sellingToken, buyingToken, tokensData]);

  // Hook para actualizar balances de tokens seleccionados
  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) {
        setInputTokenBalance(null);
        setOutputTokenBalance(null);
        return;
      }
      // Input token
      const inputToken = tokensData.find(t => t.symbol === sellingToken);
      if (inputToken) {
        if (inputToken.symbol === 'SOL') {
          const solBalance = await connection.getBalance(new PublicKey(publicKey));
          setInputTokenBalance(solBalance / LAMPORTS_PER_SOL);
        } else {
          try {
            const balance = await getTokenBalance(connection, publicKey, inputToken.address, sellingToken);
            setInputTokenBalance(balance);
          } catch {
            setInputTokenBalance(0);
          }
        }
      } else {
        setInputTokenBalance(null);
      }
      // Output token
      const outputToken = tokensData.find(t => t.symbol === buyingToken);
      if (outputToken) {
        if (outputToken.symbol === 'SOL') {
          const solBalance = await connection.getBalance(new PublicKey(publicKey));
          setOutputTokenBalance(solBalance / LAMPORTS_PER_SOL);
        } else {
          try {
            const balance = await getTokenBalance(connection, publicKey, outputToken.address, buyingToken);
            setOutputTokenBalance(balance);
          } catch {
            setOutputTokenBalance(0);
          }
        }
      } else {
        setOutputTokenBalance(null);
      }
    };
    fetchBalances();
  }, [publicKey, sellingToken, buyingToken, tokensData]);

  // Verificar balance cuando cambia el monto o el token
  useEffect(() => {
    const checkBalance = async () => {
      if (!publicKey || !sellAmount || !selectedRoute) return;

      try {
        // Verificar balance de SOL para fees
        const solBalance = await connection.getBalance(new PublicKey(publicKey));
        const minSolForFees = await getRequiredSolForFees();
        const minSolForFeesLamports = minSolForFees * LAMPORTS_PER_SOL;
        
        if (solBalance < minSolForFeesLamports) {
          const currentSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
          const requiredSol = minSolForFees.toFixed(4);
          setBalanceError(`⚠️ Insufficient SOL for fees. You need at least ${requiredSol} SOL (current: ${currentSol} SOL)`);
          return;
        }

        // Verificar balance del token que se quiere vender
        const inputToken = tokensData.find(t => t.symbol === sellingToken);
        if (!inputToken) {
          setBalanceError('Selected token not found');
          return;
        }

        // Si el token es SOL, verificar el balance de SOL
        if (inputToken.symbol === 'SOL') {
          const solAmount = solBalance / LAMPORTS_PER_SOL;
          if (solAmount < Number(sellAmount)) {
            setBalanceError(`Insufficient SOL balance. Available: ${solAmount.toFixed(6)} SOL`);
            return;
          }
          setBalanceError(null);
          return;
        }

        // Para tokens SPL y Token-2022, usar la función helper
        try {
          const availableAmount = await getTokenBalance(connection, publicKey, inputToken.address, sellingToken);
          const requiredAmount = Number(sellAmount);

          if (availableAmount < requiredAmount) {
            setBalanceError(`Insufficient ${sellingToken} balance. Available: ${availableAmount.toFixed(6)} ${sellingToken}`);
            return;
          }
          
          console.log(`✅ [Balance Check] ${sellingToken} balance OK: ${availableAmount} >= ${requiredAmount}`);
        } catch (error: any) {
          console.error(`❌ [Balance Check] Error verificando balance de ${sellingToken}:`, error);
          setBalanceError(`Error checking ${sellingToken} balance`);
          return;
        }

        // Si todo está bien, limpiar el error
        setBalanceError(null);
      } catch (error) {
        console.error('Error checking balance:', error);
        setBalanceError('Error checking token balance');
      }
    };

    checkBalance();
  }, [publicKey, sellAmount, sellingToken, selectedRoute, tokensData]);

  // Helper function to get current SOL fee requirement
  const getRequiredSolForFees = useCallback(async (): Promise<number> => {
    try {
      // Get recent blockhash to estimate fees
      const { feeCalculator } = await connection.getRecentBlockhash();
      const estimatedFee = feeCalculator?.lamportsPerSignature || 5000;
      
      // Add buffer for network congestion and multiple instructions
      // A typical swap has 3-5 instructions, so we multiply by 5 for safety
      const totalFee = estimatedFee * 5;
      
      // Convert to SOL and add buffer (minimum 0.003 SOL)
      const feeInSol = Math.max(0.003, (totalFee / LAMPORTS_PER_SOL) + 0.001);
      
      console.log(`💰 [Fee Calculation] Estimated fee: ${estimatedFee} lamports, Total required: ${feeInSol} SOL`);
      return feeInSol;
    } catch (error) {
      console.warn('⚠️ [Fee Calculation] Error getting fee estimate, using default 0.003 SOL');
      return 0.003; // Fallback to safe default
    }
  }, [connection]);

  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      openWalletModal();
      return;
    }

    // If no route selected, return
    if (!selectedRoute) return;

    try {
      setSwapping(true);
      setSwapDialogOpen(true);
      setSwapMessage('🔄 Checking balances...');

      // Check SOL balance for fees with dynamic calculation
      const solBalance = await connection.getBalance(new PublicKey(publicKey));
      const requiredSol = await getRequiredSolForFees();
      const requiredSolLamports = requiredSol * LAMPORTS_PER_SOL;
      
      if (solBalance < requiredSolLamports) {
        setSwapMessage(`⚠️ Insufficient SOL for fees. You need at least ${requiredSol.toFixed(4)} SOL (current: ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL)`);
        return; // Don't throw error, just show message and return
      }

      // Get input token data
      const inputToken = tokensData.find(t => t.symbol === sellingToken);
      if (!inputToken) {
        throw new Error('Input token not found');
      }

      setSwapMessage('🔄 Creating fee account...');
      
      // 1. Verificar/crear la ATA de la cuenta de fees para el token de input
      const feeRecipient = process.env.NEXT_PUBLIC_FEE_WALLET || '';
      const inputMint = inputToken.address;
      
      try {
        const feeATAResult = await verifyOrCreateFeeAccount(feeRecipient, inputMint);
        if (!feeATAResult?.ata) {
          throw new Error('No se pudo verificar o crear la cuenta de fees (ATA)');
        }
        console.log('✅ Fee ATA creada/verificada:', feeATAResult.ata);
      } catch (error) {
        console.error('❌ Error creando fee ATA:', error);
        setSwapMessage('❌ Error creando cuenta de fees. Intenta de nuevo.');
        return;
      }

      setSwapMessage('🔄 Building transaction...');
      
      try {
        const txBase64 = await buildSwap({
          quoteResponse: selectedRoute,
          userPublicKey: publicKey,
          feeWallet: new PublicKey(feeRecipient),
        });

        setSwapMessage('📝 Waiting for wallet approval...');
        
        try {
          const sig = await executeSwap({
            swapTxBase64: txBase64,
            walletSign: signTransaction,
            userPublicKey: publicKey,
          });

          setSwapMessage(
            `✅ Swap completed!<br/><a href="https://solscan.io/tx/${sig}" target="_blank" rel="noopener noreferrer" style="color: #22c55e; text-decoration: underline;">View on Solscan</a>`
          );

          // Clear amounts after successful swap
          setSellAmount('');
          setBuyAmount('');
          setSelectedRoute(null);
          
        } catch (walletError: any) {
          // Handle wallet-specific errors
          if (walletError.message?.includes('User rejected') || walletError.message?.includes('User cancelled')) {
            setSwapMessage('❌ Swap cancelled by user');
          } else {
            throw walletError; // Re-throw other wallet errors
          }
        }
        
      } catch (buildError: any) {
        console.error('❌ Error building swap:', buildError);
        setSwapMessage(`❌ Error building transaction: ${buildError.message}`);
        return;
      }

    } catch (error: any) {
      console.error('[Swap Error]', error);
      
      // Don't show "success" for errors
      if (error.message?.includes('User rejected') || error.message?.includes('User cancelled')) {
        setSwapMessage('❌ Swap cancelled by user');
      } else {
        setSwapMessage(error.message || 'Swap error');
      }
    } finally {
      setSwapping(false);
    }
  };

  const handleSwapTokens = () => {
    setSellingToken(buyingToken);
    setBuyingToken(sellingToken);
    setBuyAmount('');
    setSellAmount('');
    setSelectedRoute(null);
  };

  const handleImportToken = async (tokenAddress: string): Promise<boolean> => {
    const success = await importToken(tokenAddress);
    return success;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '420px',
        mx: 'auto',
      }}
    >
      <SwapPanel
        swapMode={swapMode}
        onSwapModeChange={(_, val) => val && setSwapMode(val)}
        sellingToken={sellingToken}
        buyingToken={buyingToken}
        sellAmount={sellAmount}
        buyAmount={buyAmount}
        onSellingAmountChange={setSellAmount}
        onBuyingAmountChange={setBuyAmount}
        onTokenClick={(type: 'buy' | 'sell') => {
          setModalMode(type === 'sell' ? 'selling' : 'buying');
          setSelectorOpen(true);
        }}
        onSwapClick={handleSwap}
        onSwapTokens={handleSwapTokens}
        tokensData={tokensData}
        selectedRoute={selectedRoute}
        loadingQuote={loadingQuote}
        balanceError={balanceError}
        inputTokenBalance={inputTokenBalance}
        outputTokenBalance={outputTokenBalance}
      />

      <SwapProcessingDialog
        open={swapDialogOpen}
        onClose={() => setSwapDialogOpen(false)}
        swapping={swapping}
        swapProcessMessage={swapMessage}
      />

      <TokenSelector
        open={selectorOpen}
        onClose={() => {
          setSelectorOpen(false);
          setSearchQuery('');
        }}
        onSelect={(symbol) => {
          if (modalMode === 'selling') setSellingToken(symbol);
          else if (modalMode === 'buying') setBuyingToken(symbol);
          setSelectorOpen(false);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tokensData={tokensData}
        filteredTokens={filteredTokens}
        loadingTokens={loadingTokens}
        refreshTokens={handleImportToken}
        side={modalMode === 'selling' ? 'input' : 'output'}
        loadMoreTokens={loadMoreTokens}
        allTokensLoaded={allTokensLoaded}
        forceLoadMore={forceLoadMore}
      />
    </Box>
  );
};

export default JupiterSwap;
