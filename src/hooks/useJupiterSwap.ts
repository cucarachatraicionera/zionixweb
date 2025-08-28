// src/hooks/useJupiterSwap.ts

import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionSignature,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { QuoteResponse } from '@/types/Token';
import { createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';

// 🔐 ENV variables
const JUP_API_KEY = process.env.NEXT_PUBLIC_JUPITER_API_KEY!;
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC!;
const QUOTE_URL = 'https://quote-api.jup.ag/v6'; // ✅ Para getQuote
const SWAP_URL = 'https://api.jup.ag/swap/v1';    // ✅ Para buildSwap

const connection = new Connection(RPC_URL, 'confirmed');

/**
 * 🔁 Get a quote from Jupiter API (v6 - full detail with router info)
 */
export async function getQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps = 100,
  feeBps = 100,
}: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  feeBps?: number;
}) {
  const url = new URL(`${QUOTE_URL}/quote`);
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', amount.toString());
  url.searchParams.set('slippageBps', slippageBps.toString());
  url.searchParams.set('platformFeeBps', feeBps.toString());
  url.searchParams.set('restrictIntermediateTokens', 'true');
  url.searchParams.set('includeRouter', 'true'); // ✅ Necesario para evitar 'Unknown'

  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': JUP_API_KEY,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Quote failed: ${error}`);
  }

  return await res.json();
}

/**
 * 🧾 Ensure the fee wallet has an associated token account (ATA) - works for both SPL and Token-2022
 */
export async function ensureFeeAccount(
  feeWallet: PublicKey,
  mint: PublicKey
): Promise<PublicKey> {
  try {
    // First try SPL standard
    let ata = await getAssociatedTokenAddress(mint, feeWallet);
    let info = await connection.getAccountInfo(ata);
    
    if (!info) {
      console.log('[Jupiter][ensureFeeAccount] SPL ATA no existe, intentando Token-2022...');
      
      // Try Token-2022 program
      const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
      ata = await getAssociatedTokenAddress(mint, feeWallet, false, TOKEN_2022_PROGRAM_ID);
      info = await connection.getAccountInfo(ata);
      
      if (!info) {
        console.log('[Jupiter][ensureFeeAccount] Token-2022 ATA tampoco existe, creando...');
        
        // Create ATA for Token-2022
        const createATAIx = createAssociatedTokenAccountIdempotentInstruction(
          feeWallet, // payer
          ata, // associated token account
          feeWallet, // owner
          mint, // mint
          TOKEN_2022_PROGRAM_ID
        );
        
        const transaction = new Transaction().add(createATAIx);
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = feeWallet;
        
        // Note: This requires the fee wallet to sign, which might not be possible in this context
        // For now, we'll throw an error and let the user know they need to create the ATA manually
        throw new Error(`Fee wallet needs ATA for Token-2022 mint ${mint.toBase58()}. Please create it manually or contact support.`);
      } else {
        console.log('[Jupiter][ensureFeeAccount] Token-2022 ATA encontrada:', ata.toBase58());
      }
    } else {
      console.log('[Jupiter][ensureFeeAccount] SPL ATA encontrada:', ata.toBase58());
    }
    
    return ata;
  } catch (error) {
    console.error('[Jupiter][ensureFeeAccount] Error:', error);
    throw error;
  }
}

/**
 * 🔧 Build the transaction via Jupiter (v1 - for swap execution)
 */
export async function buildSwap({
  userPublicKey,
  quoteResponse,
  feeWallet,
}: {
  userPublicKey: string;
  quoteResponse: QuoteResponse;
  feeWallet: PublicKey;
}): Promise<string> {
  const inputMint = new PublicKey(quoteResponse.routePlan[0].swapInfo.inputMint);
  const outputMint = new PublicKey(quoteResponse.routePlan[0].swapInfo.outputMint);

  let feeMint = inputMint;
  let feeAccount: PublicKey;

  try {
    feeAccount = await ensureFeeAccount(feeWallet, feeMint);
  } catch {
    feeMint = outputMint;
    feeAccount = await ensureFeeAccount(feeWallet, feeMint);
  }

  const body = {
    userPublicKey,
    quoteResponse,
    wrapUnwrapSOL: true,
    platformFee: {
      feeBps: 100,
      feeAccount: feeAccount.toBase58(),
    },
  };

  console.log('[Jupiter][buildSwap] Building transaction with fee account:', feeAccount.toBase58());

  const res = await fetch(`${SWAP_URL}/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': JUP_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!json?.swapTransaction) {
    console.warn('[Jupiter] Missing swapTransaction:', json);
    throw new Error(json.error || 'Swap transaction not received.');
  }

  // Simulate the transaction to check if it will succeed
  console.log('[Jupiter][buildSwap] Simulating transaction to verify SOL balance...');
  try {
    const txBuf = Buffer.from(json.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuf);
    
    // Get the user's current SOL balance
    const userPubkey = new PublicKey(userPublicKey);
    const solBalance = await connection.getBalance(userPubkey);
    
    // Simulate the transaction to get the exact fee requirement
    const simulation = await connection.simulateTransaction(transaction);
    
    if (simulation.value.err) {
      console.error('[Jupiter][buildSwap] Transaction simulation failed:', simulation.value.err);
      
      // Check if it's a SOL insufficient error
      if (simulation.value.logs?.some(log => log.includes('insufficient lamports'))) {
        const requiredSol = 0.005; // Conservative estimate for complex swaps
        const requiredLamports = requiredSol * LAMPORTS_PER_SOL;
        
        if (solBalance < requiredLamports) {
          const currentSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
          const neededSol = (requiredLamports / LAMPORTS_PER_SOL).toFixed(4);
          throw new Error(`Insufficient SOL for transaction. You have ${currentSol} SOL but need at least ${neededSol} SOL for fees. Please add more SOL to your wallet.`);
        }
      }
      
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
    }
    
    console.log('[Jupiter][buildSwap] Transaction simulation successful');
    
    // Verify SOL balance is sufficient for the actual transaction
    // Use a conservative estimate since simulation.value.fee might not be available
    const estimatedFee = 5000; // 0.005 SOL in lamports
    const buffer = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL buffer
    const totalRequired = estimatedFee + buffer;
    
    if (solBalance < totalRequired) {
      const currentSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
      const requiredSol = (totalRequired / LAMPORTS_PER_SOL).toFixed(4);
      throw new Error(`Insufficient SOL for transaction fees. You have ${currentSol} SOL but need at least ${requiredSol} SOL. Please add more SOL to your wallet.`);
    }
    
    console.log('[Jupiter][buildSwap] SOL balance verification passed. Proceeding with swap.');
    
  } catch (error) {
    console.error('[Jupiter][buildSwap] Error during transaction simulation:', error);
    throw error;
  }

  return json.swapTransaction;
}

/**
 * 🚀 Sign and send transaction
 */
export async function executeSwap({
  swapTxBase64,
  walletSign,
  userPublicKey,
}: {
  swapTxBase64: string;
  walletSign: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  userPublicKey: string;
}): Promise<TransactionSignature> {
  const txBuf = Buffer.from(swapTxBase64, 'base64');
  const transaction = VersionedTransaction.deserialize(txBuf);

  // Final SOL balance check before sending
  console.log('[Jupiter][executeSwap] Final SOL balance verification...');
  const userPubkey = new PublicKey(userPublicKey);
  const solBalance = await connection.getBalance(userPubkey);
  
  // Require at least 0.005 SOL for complex swaps
  const minRequiredSol = 0.005 * LAMPORTS_PER_SOL;
  
  if (solBalance < minRequiredSol) {
    const currentSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
    const requiredSol = (minRequiredSol / LAMPORTS_PER_SOL).toFixed(4);
    throw new Error(`Insufficient SOL for transaction. You have ${currentSol} SOL but need at least ${requiredSol} SOL for fees. Please add more SOL to your wallet.`);
  }

  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.message.recentBlockhash = latestBlockhash.blockhash;

  console.log('[Jupiter][executeSwap] Signing transaction...');
  const signedTx = await walletSign(transaction);
  
  console.log('[Jupiter][executeSwap] Sending transaction...');
  const rawTx = signedTx.serialize();

  try {
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      maxRetries: 3,
    });
    
    console.log('[Jupiter][executeSwap] Transaction sent successfully:', signature);
    return signature;
    
  } catch (error: any) {
    console.error('[Jupiter][executeSwap] Transaction failed:', error);
    
    // Check if it's a SOL insufficient error
    if (error.message?.includes('insufficient lamports') || error.message?.includes('insufficient SOL')) {
      const currentSol = (solBalance / LAMPORTS_PER_SOL).toFixed(4);
      throw new Error(`Transaction failed due to insufficient SOL. You have ${currentSol} SOL but the transaction requires more. Please add more SOL to your wallet.`);
    }
    
    throw error;
  }
}
