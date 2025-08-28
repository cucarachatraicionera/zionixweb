import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC;

if (!SOLANA_RPC_URL) {
  console.error("🚨 ERROR: La variable NEXT_PUBLIC_SOLANA_RPC no está definida.");
  throw new Error("NEXT_PUBLIC_SOLANA_RPC no está configurada.");
}

// ✅ Crear conexión a Solana
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// ✅ Program IDs
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"); // SPL estándar
export const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"); // Token 2022

/**
 * 🔹 Obtener balance nativo en SOL
 */
export const getSolanaNativeBalance = async (address: string): Promise<number> => {
  try {
    const lamports = await connection.getBalance(new PublicKey(address));
    return lamports / 1e9;
  } catch (err) {
    console.error("❌ [getSolanaNativeBalance]", err);
    return 0;
  }
};

/**
 * 🔹 Obtener balances de tokens SPL
 */
export const getSolanaSplBalances = async (address: string) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map(({ account }) => ({
      mint: account.data.parsed.info.mint,
      balance: account.data.parsed.info.tokenAmount.uiAmount || 0,
    }));
  } catch (err) {
    console.error("❌ [getSolanaSplBalances]", err);
    return [];
  }
};

/**
 * 🔹 Obtener balances de tokens Token-2022 (método más robusto)
 */
export const getSolanaToken2022Balances = async (address: string) => {
  try {
    console.log(`🔍 [Token-2022] Buscando tokens para: ${address}`);
    
    // Usar getTokenAccountsByOwner en lugar de getParsedTokenAccountsByOwner
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    console.log(`🔍 [Token-2022] Cuentas encontradas: ${tokenAccounts.value.length}`);

    // Obtener información detallada de cada cuenta
    const tokens = await Promise.all(
      tokenAccounts.value.map(async ({ pubkey, account }) => {
        try {
          const accountInfo = await connection.getParsedAccountInfo(pubkey);
          if (!accountInfo.value) return null;
          
          const parsedData = accountInfo.value.data as any;
          if (!parsedData.parsed) return null;
          
          const mint = parsedData.parsed.info.mint;
          const balance = parsedData.parsed.info.tokenAmount.uiAmount || 0;
          
          console.log(`🔍 [Token-2022] Token ${mint}: balance = ${balance}`);
          
          return {
            mint,
            balance,
            account: pubkey.toBase58()
          };
        } catch (err) {
          console.error(`❌ [Token-2022] Error procesando cuenta:`, err);
          return null;
        }
      })
    );

    const validTokens = tokens.filter((t): t is NonNullable<typeof t> => t !== null);
    console.log(`✅ [Token-2022] Encontrados ${validTokens.length} tokens válidos:`, validTokens);
    return validTokens;
  } catch (err) {
    console.error("❌ [getSolanaToken2022Balances]", err);
    return [];
  }
};

/**
 * 🔹 Obtener balances de tokens Token-2022 (método alternativo más eficiente)
 */
export const getSolanaToken2022BalancesAlt = async (address: string) => {
  try {
    console.log(`🔍 [Token-2022 Alt] Buscando tokens para: ${address}`);
    
    // Obtener todas las cuentas de token del owner
    const tokenAccounts = await connection.getTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    if (tokenAccounts.value.length === 0) {
      console.log(`⚠️ [Token-2022 Alt] No se encontraron cuentas Token-2022`);
      return [];
    }

    console.log(`🔍 [Token-2022 Alt] Cuentas encontradas: ${tokenAccounts.value.length}`);

    // Obtener información de todas las cuentas en una sola llamada
    const accountKeys = tokenAccounts.value.map(({ pubkey }) => pubkey);
    const accountsInfo = await connection.getMultipleAccountsInfo(accountKeys);

    const tokens = accountsInfo.map((accountInfo, index) => {
      if (!accountInfo) return null;
      
      try {
        // Parsear manualmente la información de la cuenta
        const data = accountInfo.data;
        if (data.length < 82) return null; // Tamaño mínimo para cuenta de token
        
        // Extraer mint address (bytes 0-31)
        const mint = new PublicKey(data.slice(0, 32)).toBase58();
        
        // Extraer balance (bytes 64-71, little-endian)
        const balanceBytes = data.slice(64, 72);
        const balance = Number(new DataView(balanceBytes.buffer, balanceBytes.byteOffset, balanceBytes.byteLength).getBigUint64(0, true));
        
        // Extraer decimals (byte 45)
        const decimals = data[45];
        
        // Calcular balance real
        const realBalance = balance / Math.pow(10, decimals);
        
        console.log(`🔍 [Token-2022 Alt] Token ${mint}: raw=${balance}, decimals=${decimals}, balance=${realBalance}`);
        
        return {
          mint,
          balance: realBalance,
          account: accountKeys[index].toBase58()
        };
      } catch (err) {
        console.error(`❌ [Token-2022 Alt] Error procesando cuenta ${index}:`, err);
        return null;
      }
    });

    const validTokens = tokens.filter((t): t is NonNullable<typeof t> => t !== null);
    console.log(`✅ [Token-2022 Alt] Encontrados ${validTokens.length} tokens válidos:`, validTokens);
    return validTokens;
  } catch (err) {
    console.error("❌ [getSolanaToken2022BalancesAlt]", err);
    return [];
  }
};

/**
 * 🔹 Verificar tokens específicos conocidos (fallback para Token-2022)
 */
export const checkKnownToken2022Tokens = async (address: string) => {
  try {
    console.log(`🔍 [checkKnownToken2022Tokens] Verificando tokens conocidos para: ${address}`);
    
    // Lista de tokens Token-2022 conocidos que podrían estar en el wallet
    const knownTokens = [
      // Wazaaa (WZA) - Token-2022
      'WzZ3yHDgUeLFuQaHxrqCxYbqojLk1erGqM1YkkL9V',
      // Otros tokens Token-2022 conocidos pueden agregarse aquí
    ];

    const foundTokens = [];
    
    for (const mint of knownTokens) {
      try {
        // Buscar la cuenta de token asociada
        const tokenAccount = await connection.getTokenAccountsByOwner(
          new PublicKey(address),
          { mint: new PublicKey(mint) }
        );

        if (tokenAccount.value.length > 0) {
          const accountInfo = await connection.getParsedAccountInfo(tokenAccount.value[0].pubkey);
          if (accountInfo.value) {
            const parsedData = accountInfo.value.data as any;
            if (parsedData.parsed) {
              const balance = parsedData.parsed.info.tokenAmount.uiAmount || 0;
              if (balance > 0) {
                console.log(`✅ [checkKnownToken2022Tokens] Encontrado ${mint} con balance: ${balance}`);
                foundTokens.push({
                  mint,
                  balance,
                  account: tokenAccount.value[0].pubkey.toBase58()
                });
              }
            }
          }
        }
      } catch (err) {
        console.log(`⚠️ [checkKnownToken2022Tokens] Error verificando ${mint}:`, err);
      }
    }

    console.log(`✅ [checkKnownToken2022Tokens] Tokens conocidos encontrados:`, foundTokens);
    return foundTokens;
  } catch (err) {
    console.error("❌ [checkKnownToken2022Tokens]", err);
    return [];
  }
};

/**
 * 🔹 Obtener todos los balances (SOL + SPL + Token-2022)
 */
export const getSolanaFullBalances = async (address: string) => {
  try {
    console.log(`🔍 [getSolanaFullBalances] Obteniendo balances para: ${address}`);
    
    const [sol, spl] = await Promise.all([
      getSolanaNativeBalance(address),
      getSolanaSplBalances(address),
    ]);

    // Intentar ambos métodos para Token-2022
    let token2022: any[] = [];
    try {
      console.log(`🔍 [getSolanaFullBalances] Intentando método principal para Token-2022...`);
      token2022 = await getSolanaToken2022Balances(address);
    } catch (err) {
      console.log(`⚠️ [getSolanaFullBalances] Método principal falló, intentando alternativo...`);
      try {
        token2022 = await getSolanaToken2022BalancesAlt(address);
      } catch (err2) {
        console.error(`❌ [getSolanaFullBalances] Ambos métodos fallaron para Token-2022:`, err2);
        token2022 = [];
      }
    }

    // Si no se encontraron tokens Token-2022, verificar tokens conocidos específicos
    if (token2022.length === 0) {
      console.log(`🔍 [getSolanaFullBalances] No se encontraron tokens Token-2022, verificando tokens conocidos...`);
      try {
        const knownTokens = await checkKnownToken2022Tokens(address);
        if (knownTokens.length > 0) {
          console.log(`✅ [getSolanaFullBalances] Agregando ${knownTokens.length} tokens conocidos`);
          token2022 = [...token2022, ...knownTokens];
        }
      } catch (err) {
        console.log(`⚠️ [getSolanaFullBalances] Error verificando tokens conocidos:`, err);
      }
    }

    const allTokens = [...spl, ...token2022];
    console.log(`✅ [getSolanaFullBalances] Total tokens encontrados: ${allTokens.length}`);
    console.log(`   - SOL: ${sol}`);
    console.log(`   - SPL: ${spl.length}`);
    console.log(`   - Token-2022: ${token2022.length}`);
    
    // Log tokens con balance > 0
    const withBalance = allTokens.filter(t => t.balance > 0);
    console.log(`💰 Tokens con balance > 0:`, withBalance);

    return {
      sol,
      spl: allTokens,
    };
  } catch (err) {
    console.error("❌ [getSolanaFullBalances]", err);
    return { sol: 0, spl: [] };
  }
};
