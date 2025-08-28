// /pages/api/price.ts
import { NextRequest } from 'next/server';
import axios from 'axios';
import { NextResponse } from 'next/server';

let solToUsdRate: number | null = null;
let lastFetched: number | null = null;

const fetchSolToUsdtRate = async () => {
    const now = Date.now();
    if (lastFetched && (now - lastFetched) < 30000) { // 30 segundos de margen
        return;
    }

    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        solToUsdRate = response.data.solana.usd;
        lastFetched = now;
        console.log(`Updated SOL to USD rate: ${solToUsdRate}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching SOL to USD rate:', errorMessage);
        throw new Error('Error fetching SOL to USD rate');
    }
};

const handleCalculateSOL = (amount: number, pricePerToken: number): number => {
    if (solToUsdRate !== null && solToUsdRate > 0) {
        const solCost = Math.round(((amount * pricePerToken / solToUsdRate) + Number.EPSILON) * 100000) / 100000;
        return solCost;
    }
    return 0;
};

export const GET = async () => {
    try {
        await fetchSolToUsdtRate();

        if (solToUsdRate !== null) {
            return NextResponse.json({ rate: solToUsdRate });
        } else {
            return NextResponse.json({ error: 'Rate not available' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch price' },
            { status: 500 }
        );
    }
};

export const POST = async (req: NextRequest) => {
    try {
        await fetchSolToUsdtRate();

        const body = await req.json();
        const { amount, pricePerToken } = body;
        const solCost = handleCalculateSOL(amount, pricePerToken);
        return NextResponse.json({ cost: solCost });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to calculate cost' },
            { status: 500 }
        );
    }
};
