import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import yahooFinance from 'yahoo-finance2';

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { ticker, shares, purchasePrice, purchaseDate } = await request.json();
    await connectDB();

    const userId = params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current price and company name from Yahoo Finance
    try {
      const quote = await yahooFinance.quote(ticker);
      if (!quote.regularMarketPrice) {
        throw new Error('Invalid stock data');
      }

      const companyName = quote.longName || quote.shortName || ticker;

      // Calculate total cost
      const totalCost = shares * purchasePrice;
      if (user.cashRemaining < totalCost) {
        return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
      }

      // Add stock to user's portfolio
      user.portfolio.push({
        ticker,
        shares,
        purchasePrice,
        companyName,
        purchaseDate: new Date(purchaseDate),
      });

      // Update cash
      user.cashRemaining -= totalCost;
      await user.save();

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error adding stock:', err);
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { stockId } = await request.json();
    await connectDB();

    const userId = params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stock = user.portfolio.id(stockId);
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Return funds to user
    user.cashRemaining += stock.shares * stock.purchasePrice;
    user.portfolio.pull(stockId);
    await user.save();

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 });
  }
}
