// src/utils/feeAccount.helper.ts
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
  } from '@solana/web3.js';
  import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
  } from '@solana/spl-token';
  import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
  import dotenv from 'dotenv';
  
  dotenv.config();
  
  const RPC_URL = process.env.SOLANA_RPC!;
  const FEE_RECEIVER = new PublicKey(process.env.FEE_RECEIVER_WALLET!);
  const FEE_INITIALIZER_KEYPAIR = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.FEE_INITIALIZER_SECRET!))
  );
  
  const conn = new Connection(RPC_URL, 'confirmed');
  
  // 🔍 Detectar si el mint es Token-2022
  export async function isToken2022(mint: PublicKey): Promise<boolean> {
    const acc = await conn.getAccountInfo(mint);
    return acc?.owner.equals(TOKEN_2022_PROGRAM_ID) ?? false;
  }
  
  // 🔹 Verifica si la cuenta SOL existe y tiene rent-exemption mínima
  export async function ensureFeeSOLAccount(minAmount = 0.001): Promise<void> {
    const acc = await conn.getAccountInfo(FEE_RECEIVER);
    const minRent = await conn.getMinimumBalanceForRentExemption(0);
  
    if (acc) {
      console.log(`✅ Cuenta FEE_RECEIVER_WALLET ya existe con ${acc.lamports / 1e9} SOL`);
      return;
    }
  
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: FEE_INITIALIZER_KEYPAIR.publicKey,
        toPubkey: FEE_RECEIVER,
        lamports: minRent + Math.floor(minAmount * 1e9),
      })
    );
  
    console.log('🛠️ Creando cuenta de comisiones (SOL)...');
    await sendAndConfirmTransaction(conn, tx, [FEE_INITIALIZER_KEYPAIR]);
    console.log(`✅ Cuenta SOL creada correctamente con al menos ${minAmount} SOL`);
  }
  
  // 🔹 Verifica o crea la ATA para SPL / SPL2022
  export async function ensureFeeATA(mintAddress: string): Promise<string> {
    const mint = new PublicKey(mintAddress);
    const is2022 = await isToken2022(mint);
    const tokenProgramId = is2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
  
    const ata = await getAssociatedTokenAddress(
      mint,
      FEE_RECEIVER,
      false,
      tokenProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  
    const ataInfo = await conn.getAccountInfo(ata);
    if (ataInfo) {
      console.log(`✅ ATA de comisiones ya existe: ${ata.toBase58()}`);
      return ata.toBase58();
    }
  
    const ix = createAssociatedTokenAccountInstruction(
      FEE_INITIALIZER_KEYPAIR.publicKey, // Payer
      ata,
      FEE_RECEIVER,
      mint,
      tokenProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  
    const tx = new Transaction().add(ix);
    tx.feePayer = FEE_INITIALIZER_KEYPAIR.publicKey;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
  
    console.log('🛠️ Creando ATA para comisiones...');
    await sendAndConfirmTransaction(conn, tx, [FEE_INITIALIZER_KEYPAIR]);
    console.log(`✅ ATA creada exitosamente: ${ata.toBase58()}`);
  
    return ata.toBase58();
  }
  