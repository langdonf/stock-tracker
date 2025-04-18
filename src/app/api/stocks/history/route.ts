import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker parameter is required' }, { status: 400 });
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    } as const;

    const result = await yahooFinance.historical(ticker, queryOptions);

    // Format the data for our needs
    const historicalData = result.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      close: parseFloat(day.close.toFixed(2)),
    }));

    return NextResponse.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
