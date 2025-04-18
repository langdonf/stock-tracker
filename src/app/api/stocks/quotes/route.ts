import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

type YahooField =
  | 'symbol'
  | 'longName'
  | 'shortName'
  | 'regularMarketPrice'
  | 'regularMarketDayHigh'
  | 'regularMarketDayLow'
  | 'regularMarketChange'
  | 'regularMarketChangePercent'
  | 'fiftyTwoWeekHigh'
  | 'fiftyTwoWeekLow';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get('tickers');

  if (!tickers) {
    return NextResponse.json({ error: 'Tickers are required' }, { status: 400 });
  }

  const tickerArray = tickers.split(',');

    // Set up query options with specific fields we need
    const queryOptions = {
      fields: [
        'symbol',
        'longName',
        'shortName',
        'regularMarketPrice',
        'regularMarketDayHigh',
        'regularMarketDayLow',
        'regularMarketChange',
        'regularMarketChangePercent',
        'fiftyTwoWeekHigh',
        'fiftyTwoWeekLow',
      ] as YahooField[],
    };

    // Set up module options for better error handling
    const moduleOptions = {
      validateResult: true as const,
      fetchOptions: {
        timeout: 10000, // 10 second timeout
      },
    };

    const quotes = await Promise.all(
      tickerArray.map(async ticker => {
          return await yahooFinance.quoteCombine(ticker, queryOptions, moduleOptions);
      })
    );

    interface StockQuote {
      ticker: string;
      companyName: string;
      currentPrice: number;
      dailyHigh: number;
      dailyLow: number;
      dailyChange: number;
      dailyChangePercent: number;
      fiftyTwoWeekHigh: number;
      fiftyTwoWeekLow: number;
    }

    const results = quotes.reduce<Record<string, StockQuote>>(
      (acc, quote) => {
        if (!quote) return acc;

        acc[quote.symbol] = {
          ticker: quote.symbol,
          companyName: quote.longName || quote.shortName || '',
          currentPrice: quote.regularMarketPrice || 0,
          dailyHigh: quote.regularMarketDayHigh || 0,
          dailyLow: quote.regularMarketDayLow || 0,
          dailyChange: quote.regularMarketChange || 0,
          dailyChangePercent: quote.regularMarketChangePercent || 0,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
        };
        return acc;
      },
      {}
    );

    // If we got no valid results at all, return an error
    if (Object.keys(results).length === 0) {
      return NextResponse.json({ error: 'Failed to fetch any stock data' }, { status: 500 });
    }

    return NextResponse.json(results);
}
