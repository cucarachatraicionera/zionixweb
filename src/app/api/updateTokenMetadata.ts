import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebaseConfig';
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  doc,
  query,
  where,
} from 'firebase/firestore';
import axios from 'axios';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  icon?: string | null;
  decimals: number;
  holders?: number;
  market_cap?: number;
  price?: number;
  price_24h_change?: number;
}

const SOLSCAN_META_URL = 'https://pro-api.solscan.io/v2.0/token/meta';
const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/token/list';
const COLLECTION_NAME = 'tokens';
const MAX_TOKENS_PER_PAGE = 100;
const REQUEST_DELAY_MS = 300;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const { address } = req.body;

    if (address) {
      const result = await addOrUpdateSingleToken(address);
      return res.status(200).json(result);
    } else {
      const result = await syncAllTokens();
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error('[Token API Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function addOrUpdateSingleToken(address: string) {
  try {
    const metadata = await fetchTokenMetadata(address);
    if (!metadata) {
      return { success: false, message: 'Metadata not found' };
    }

    const existingRef = collection(db, COLLECTION_NAME);
    const tokenQuery = query(existingRef, where('address', '==', address));
    const snapshot = await getDocs(tokenQuery);

    if (!snapshot.empty) {
      const id = snapshot.docs[0].id;
      await setDoc(doc(db, COLLECTION_NAME, id), metadata, { merge: true });
      return { success: true, message: 'Token metadata updated', token: metadata };
    }

    await addDoc(existingRef, metadata);
    return { success: true, message: 'Token added to Firestore', token: metadata };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing token',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function syncAllTokens() {
  let page = 1;
  let totalAdded = 0;
  let totalSkipped = 0;
  const errors: any[] = [];

  while (true) {
    const tokens = await fetchTokensFromSolscan(page);
    if (tokens.length === 0) break;

    const result = await saveTokensToFirestore(tokens);
    totalAdded += result.added;
    totalSkipped += result.skipped;
    errors.push(...result.errors);

    page++;
    await delay(REQUEST_DELAY_MS);
  }

  return {
    success: true,
    message: 'Token sync completed',
    totalAdded,
    totalSkipped,
    errors,
  };
}

async function fetchTokenMetadata(address: string): Promise<TokenData | null> {
  try {
    const res = await axios.get(SOLSCAN_META_URL, {
      params: { address },
      headers: { token: process.env.SOLSCAN_API_TOKEN },
    });

    const data = res.data?.data;
    if (!data) return null;

    return {
      address: data.address,
      name: data.name,
      symbol: data.symbol,
      icon: data.icon || null,
      decimals: data.decimals || 0,
      holders: data.holders || 0,
      market_cap: data.market_cap || null,
      price: data.price || null,
      price_24h_change: data.price_24h_change || null,
    };
  } catch (err) {
    console.error('[fetchTokenMetadata] Failed:', err);
    return null;
  }
}

async function fetchTokensFromSolscan(page: number): Promise<TokenData[]> {
  try {
    const res = await axios.get(SOLSCAN_API_URL, {
      params: {
        page,
        page_size: MAX_TOKENS_PER_PAGE,
        sort_by: 'market_cap',
        sort_order: 'desc',
      },
      headers: { token: process.env.SOLSCAN_API_TOKEN },
    });

    return res.data?.data || [];
  } catch (error) {
    console.error('[fetchTokensFromSolscan] Error:', error);
    return [];
  }
}

async function saveTokensToFirestore(tokens: TokenData[]) {
  const collectionRef = collection(db, COLLECTION_NAME);
  let added = 0;
  let skipped = 0;
  const errors: any[] = [];

  for (const token of tokens) {
    try {
      if (!token.address || !token.symbol || !token.name) {
        skipped++;
        continue;
      }

      const queryRef = query(collectionRef, where('address', '==', token.address));
      const snapshot = await getDocs(queryRef);

      if (snapshot.empty) {
        await addDoc(collectionRef, token);
        added++;
      } else {
        skipped++;
      }
    } catch (error) {
      errors.push({ token, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return { added, skipped, errors };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
