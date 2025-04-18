import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

type Params = Promise<{ userId: string; stockId: string }>;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  const { userId, stockId } = await params;
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stock = user.portfolio.id(stockId);
  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  // Get current value from query params
  const url = new URL(request.url);
  const currentValue = parseFloat(url.searchParams.get('currentValue') || '0');

  // Return funds to user using current value
  user.cashRemaining += currentValue;
  user.portfolio.pull(stockId);
  await user.save();

  return NextResponse.json(user);
}
