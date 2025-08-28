// pages/api/createFeeATA.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  Keypair,
  PublicKey,
  Connection,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { TOKEN_PROGRAM_2022_ID } from '../../utils/constants';
import dotenv from 'dotenv';
import { NextResponse } from 'next/server';

interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

dotenv.config();

// -----------------------------------------------------------------------------
// 🔹 1) Validamos que las variables de entorno requeridas estén definidas
// -----------------------------------------------------------------------------
const REQUIRED_ENV_VARS = ['SECRET_KEY', 'SOLANA_RPC_ENDPOINT'];
REQUIRED_ENV_VARS.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`❌ ERROR: Falta la variable de entorno ${varName}`);
  }
});

// 🔹 2) Inicializamos la conexión a Solana y la wallet del administrador
const secretKeyArray = JSON.parse(process.env.SECRET_KEY!);
if (!Array.isArray(secretKeyArray)) {
  throw new Error(`❌ ERROR: SECRET_KEY no es un array válido en el .env`);
}
const secretKey = new Uint8Array(secretKeyArray);
const senderKeypair = Keypair.fromSecretKey(secretKey);
const connection = new Connection(process.env.SOLANA_RPC_ENDPOINT!, 'confirmed');

// -----------------------------------------------------------------------------
// 🔍 3) Función para verificar si un token es de Token Program 2022
// -----------------------------------------------------------------------------
async function isMint2022(mint: PublicKey): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(mint);
    if (!accountInfo) {
      console.error(`❌ ERROR: El mint no existe en la red: ${mint.toBase58()}`);
      return false;
    }

    if (accountInfo.owner.equals(TOKEN_PROGRAM_2022_ID)) {
      console.log(`✅ Confirmado: ${mint.toBase58()} es un Token 2022.`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ ERROR en isMint2022:", error);
    return false;
  }
}

// -----------------------------------------------------------------------------
// 🔹 4) Función para verificar o crear la cuenta ATA
// -----------------------------------------------------------------------------
async function checkOrCreateZionixTokenAccount(
  recipientAddress: string,
  mintAddress: string
): Promise<{ ata: string; isToken2022: boolean }> {
  const recipientPublicKey = new PublicKey(recipientAddress);
  const tokenMintAddress = new PublicKey(mintAddress);

  console.log(`🔎 Revisando ATA: owner=${recipientPublicKey.toBase58()}, mint=${tokenMintAddress.toBase58()}`);

  // 🔹 Detectamos si el mint pertenece a Token 2022
  const mintIs2022 = await isMint2022(tokenMintAddress);
  console.log(`🔍 ¿SPL Token 2022?: ${mintIs2022}`);

  // 🔹 Definir el programa de tokens correcto
  const tokenProgramId = mintIs2022 ? TOKEN_PROGRAM_2022_ID : TOKEN_PROGRAM_ID;

  // 🔹 Obtener la dirección de la ATA
  const associatedTokenAddress = await getAssociatedTokenAddress(
    tokenMintAddress,
    recipientPublicKey,
    false,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // 🔹 Verificar si la cuenta ya existe
  const accountInfo = await connection.getParsedAccountInfo(associatedTokenAddress);
  if (accountInfo.value) {
    console.log(`✅ La ATA ya existe => ${associatedTokenAddress.toBase58()}`);
    return { ata: associatedTokenAddress.toBase58(), isToken2022: mintIs2022 };
  }

  // 🔹 Si no existe, creamos la ATA
  console.log(`❌ No existe la ATA, procediendo a crearla...`);
  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const createATAIx = createAssociatedTokenAccountInstruction(
    senderKeypair.publicKey,      
    associatedTokenAddress,       
    recipientPublicKey,           
    tokenMintAddress,             
    tokenProgramId,               
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction().add(createATAIx);
  transaction.feePayer = senderKeypair.publicKey;
  transaction.recentBlockhash = blockhash;

  transaction.sign(senderKeypair);
  const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

  console.log(`✅ Creada la ATA => ${associatedTokenAddress.toBase58()}, tx=${signature}`);
  return { ata: associatedTokenAddress.toBase58(), isToken2022: mintIs2022 };
}

// -----------------------------------------------------------------------------
// 🚀 5) Handler principal: /api/createFeeATA
// -----------------------------------------------------------------------------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
    }

    const { feeRecipient, feeMint } = req.body;
    if (!feeRecipient || !feeMint) {
      return res.status(400).json({ success: false, error: '❌ Faltan parámetros: feeRecipient, feeMint' });
    }

    console.log(`[createFeeATA] feeRecipient=${feeRecipient}, feeMint=${feeMint}`);
    
    // ✅ Verificamos o creamos la cuenta ATA
    const { ata, isToken2022 } = await checkOrCreateZionixTokenAccount(feeRecipient, feeMint);

    // ✅ Respuesta con `isToken2022`
    console.log(`✅ /api/createFeeATA finalizado => ATA: ${ata}, Token 2022: ${isToken2022}`);
    return res.status(200).json({ success: true, ata, isToken2022 });

  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
