import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get('tickers');

  if (!tickers) {
    return NextResponse.json({ error: 'Tickers are required' }, { status: 400 });
  }

  const tickerArray = tickers.split(',');

  try {
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
      ],
    };

    // Set up module options for better error handling
    const moduleOptions = {
      validateResult: true, // Ensure we get valid data
      fetchOptions: {
        timeout: 10000, // 10 second timeout
      },
    };

    const quotes = await Promise.all(
      tickerArray.map(async ticker => {
        try {
          return await yahooFinance.quoteCombine(ticker, queryOptions, moduleOptions);
        } catch (error) {
          if (error instanceof yahooFinance.errors.FailedYahooValidationError) {
            console.warn(`Validation error for ${ticker}:`, error.message);
            return null;
          } else if (error instanceof yahooFinance.errors.HTTPError) {
            console.warn(`HTTP error for ${ticker}: ${error.message}`);
            return null;
          } else {
            console.error(`Unknown error fetching ${ticker}:`, error);
            return null;
          }
        }
      })
    );

    const results = quotes.reduce(
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
      {} as Record<string, any>
    );

    // If we got no valid results at all, return an error
    if (Object.keys(results).length === 0) {
      return NextResponse.json({ error: 'Failed to fetch any stock data' }, { status: 500 });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error('Error fetching stock quotes:', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to fetch stock data',
      },
      { status: 500 }
    );
  }
}
