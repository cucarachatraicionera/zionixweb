import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';


// Define your constants here
export const ENDPOINT = 'https://maximum-muddy-star.solana-mainnet.quiknode.pro/0a69a708c0f9bc6d9efd9314f0f69e6e72132aff/';
export const WEBSOCKET_ENDPOINT = 'wss://maximum-muddy-star.solana-mainnet.quiknode.pro/0a69a708c0f9bc6d9efd9314f0f69e6e72132aff/';
export const USDT_MINT_ADDRESS = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
export const RECIPIENT_USDT = '5B14E1fiMq2wWb74nLT8n8Jgw8xrVRkRNuzgibTtURGu';
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
export const WAZAA_TOKEN_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const PRICE_PER_TOKEN = 0.001;
export const WAZAA_TOKEN_MINT_ADDRESS = new PublicKey('wazaa7bThYUd6rZmoj6pqGfDWuHKqgihovDCSBn3N3U');
export const RECIPIENT_SOL = '5B14E1fiMq2wWb74nLT8n8Jgw8xrVRkRNuzgibTtURGu';
export const TOKEN_PROGRAM_2022_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

// Add function to convert the private key
export const convertPrivateKey = (key: string): Uint8Array => {
    try {
        console.log('Private Key String:', key); // Log the private key
        const keyArray = JSON.parse(key);
        console.log('Parsed Private Key Array:', keyArray); // Log the parsed key array
        return Uint8Array.from(keyArray);
    } catch (error) {
        console.error('Error parsing private key:', error);
        throw new Error('Invalid private key format');
    }
};


//// Jupiter Swap

export const FEE_RECIPIENT = new PublicKey('5B14E1fiMq2wWb74nLT8n8Jgw8xrVRkRNuzgibTtURGu');
export const FEE_PERCENTAGE = 0.5; // 0.3% en base 1



export const ensureFeeAccount = async (
    connection: Connection,
    owner: PublicKey,
    mint: PublicKey,
    payer: Keypair // Cuenta que pagará la transacción si es necesario
): Promise<PublicKey> => {
    const feeAccount = await getAssociatedTokenAddress(mint, owner);

    // Verificar si la cuenta ya existe
    const accountInfo = await connection.getAccountInfo(feeAccount);
    if (!accountInfo) {
        console.log(`[JupiterSwap] 🚀 Creando cuenta de fees SPL para el token: ${mint.toBase58()}`);

        const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                payer.publicKey, // Quien paga la transacción
                feeAccount, // Dirección de la cuenta SPL que se creará
                owner, // Dueño de la cuenta
                mint // Token de la cuenta
            )
        );

        await sendAndConfirmTransaction(connection, transaction, [payer]);

        console.log(`[JupiterSwap] ✅ Cuenta creada: ${feeAccount.toBase58()}`);
    } else {
        console.log(`[JupiterSwap] ✅ Cuenta de fees existente: ${feeAccount.toBase58()}`);
    }

    return feeAccount;
};


  