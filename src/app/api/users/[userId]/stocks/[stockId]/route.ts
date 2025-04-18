import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string; stockId: string } }
) {
  try {
    // Wait for params to be available
    const userId = await params.userId;
    const stockId = await params.stockId;

    if (!userId || !stockId) {
      return NextResponse.json({ error: 'User ID and Stock ID are required' }, { status: 400 });
    }

    await connectDB();

    // Find the user and their stock
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the stock in the user's portfolio
    const stockToDelete = user.portfolio.id(stockId);
    if (!stockToDelete) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Get the current value from the request URL search params
    const url = new URL(request.url);
    const currentValue = parseFloat(url.searchParams.get('currentValue') || '0');

    // Remove the stock and update cash remaining with current value
    user.portfolio.pull(stockId);
    user.cashRemaining += currentValue;

    // Save the changes
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
