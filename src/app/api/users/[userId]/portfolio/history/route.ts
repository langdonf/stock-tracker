import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { calculatePortfolioValue } from '@/utils/portfolioCalculations';

interface HistoricalValue {
  date: Date;
  value: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize historicalValues if it doesn't exist
    if (!user.historicalValues) {
      user.historicalValues = [];
      await user.save();
    }

    // Get the last 30 days of historical values
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalValues = user.historicalValues
      .filter((value: HistoricalValue) => value.date >= thirtyDaysAgo)
      .sort((a: HistoricalValue, b: HistoricalValue) => a.date.getTime() - b.date.getTime());

    return NextResponse.json(historicalValues);
  } catch (error) {
    console.error('Error fetching historical values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical values' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { userId } = await params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize historicalValues if it doesn't exist
    if (!user.historicalValues) {
      user.historicalValues = [];
    }

    // Calculate current portfolio value
    const currentPrices = await request.json();
    const portfolioValue = calculatePortfolioValue(user, currentPrices);

    // Add new historical value
    user.historicalValues.push({
      date: new Date(),
      value: portfolioValue,
    });

    // Keep only the last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    user.historicalValues = user.historicalValues.filter(
      (value: HistoricalValue) => value.date >= thirtyDaysAgo
    );

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating historical values:', error);
    return NextResponse.json(
      { error: 'Failed to update historical values' },
      { status: 500 }
    );
  }
} 