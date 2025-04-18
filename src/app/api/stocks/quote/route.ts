import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
  }

  try {
    const quote = await yahooFinance.quote(ticker);
    return NextResponse.json({
      ticker: quote.symbol,
      companyName: quote.longName || quote.shortName || '',
      currentPrice: quote.regularMarketPrice,
      dailyHigh: quote.regularMarketDayHigh || 0,
      dailyLow: quote.regularMarketDayLow || 0,
      dailyChange: quote.regularMarketChange || 0,
      dailyChangePercent: quote.regularMarketChangePercent || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
    });
  } catch (err) {
    console.error('Error fetching stock quote:', err);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
