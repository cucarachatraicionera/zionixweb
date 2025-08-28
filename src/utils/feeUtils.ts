// utils/feeUtils.ts
import { PublicKey, Connection, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC!;
const connection = new Connection(RPC_URL, 'confirmed');

/**
 * Verifies if the fee recipient's ATA exists and creates it if it doesn't.
 * Handles both SOL and SPL tokens.
 *
 * @param {string} feeRecipient - The address that will receive fees
 * @param {string} feeMint - The token mint address
 * @returns {Promise<{ exists: boolean; ata: string; isSOL?: boolean; message?: string } | null>}
 */
export async function verifyOrCreateFeeAccount(
  feeRecipient: string,
  feeMint: string
): Promise<{ exists: boolean; ata: string; isSOL?: boolean; message?: string } | null> {
  try {
    console.log(`[verifyOrCreateFeeAccount] Checking fee account for mint: ${feeMint}`);
    
    // Handle SOL token
    if (feeMint === 'So11111111111111111111111111111111111111112') {
      console.log('[verifyOrCreateFeeAccount] 🌞 Native SOL detected -> using direct address');
      return {
        exists: true,
        ata: feeRecipient,
        isSOL: true,
        message: 'Using native SOL address directly'
      };
    }

    const feeRecipientPK = new PublicKey(feeRecipient);
    const feeMintPK = new PublicKey(feeMint);

    // Try to get the ATA address
    let ata: PublicKey;
    try {
      ata = await getAssociatedTokenAddress(
        feeMintPK,
        feeRecipientPK,
        false,
        TOKEN_PROGRAM_ID
      );
    } catch (error) {
      console.warn(`[verifyOrCreateFeeAccount] Could not get standard SPL ATA: ${error}`);
      try {
        ata = await getAssociatedTokenAddress(
          feeMintPK,
          feeRecipientPK,
          false,
          TOKEN_2022_PROGRAM_ID
        );
      } catch (error) {
        console.error(`[verifyOrCreateFeeAccount] Could not get Token-2022 ATA: ${error}`);
        throw new Error('Could not determine ATA address');
      }
    }

    // Check if the ATA exists
    const ataInfo = await connection.getAccountInfo(ata);
    if (ataInfo) {
      console.log(`[verifyOrCreateFeeAccount] ✅ ATA exists: ${ata.toBase58()}`);
      return {
        exists: true,
        ata: ata.toBase58(),
        isSOL: false,
        message: 'ATA exists'
      };
    }

    // If we get here, we need to create the ATA
    console.log(`[verifyOrCreateFeeAccount] 🛠️ Creating ATA: ${ata.toBase58()}`);
    
    // Call the API to create the ATA
    try {
      const response = await fetch('/api/createFeeATA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeRecipient, feeMint })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ata) {
          console.log(`[verifyOrCreateFeeAccount] ✅ API created ATA: ${data.ata}`);
          return {
            exists: true,
            ata: data.ata,
            isSOL: false,
            message: 'ATA created via API'
          };
        }
      }
    } catch (error) {
      console.warn(`[verifyOrCreateFeeAccount] API call failed: ${error}`);
    }

    // If API call failed, return the ATA address but mark it as not existing
    return {
      exists: false,
      ata: ata.toBase58(),
      isSOL: false,
      message: 'ATA needs to be created'
    };

  } catch (error) {
    console.error('[verifyOrCreateFeeAccount] Error:', error);
    return {
      exists: false,
      ata: '',
      message: `Error: ${(error as Error).message}`
    };
  }
}
