import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import yahooFinance from 'yahoo-finance2';

interface Quote {
  regularMarketPrice: number | null;
  longName?: string;
  shortName?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { ticker, shares, purchasePrice, purchaseDate } = await request.json();
    await connectDB();

    const { userId } = await params; // ✅ await the params promise

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      const quoteResponse = await yahooFinance.quote(ticker);
      const quote = (Array.isArray(quoteResponse) ? quoteResponse[0] : quoteResponse) as Quote;

      if (!quote.regularMarketPrice) {
        throw new Error('Invalid stock data');
      }

      const companyName = quote.longName || quote.shortName || ticker;
      const totalCost = shares * purchasePrice;

      if (user.cashRemaining < totalCost) {
        return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
      }

      user.portfolio.push({
        ticker,
        shares,
        purchasePrice,
        companyName,
        purchaseDate: new Date(purchaseDate),
      });

      user.cashRemaining -= totalCost;
      await user.save();

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Error adding stock:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add stock' },
      { status: 500 }
    );
  }
}
