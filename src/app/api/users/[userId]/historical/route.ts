import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const { value } = await request.json();
    const { userId } = params;

    if (!value || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Valid value is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add new historical value
    user.historicalValues.push({
      date: new Date(),
      value,
    });

    await user.save();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating historical values:', error);
    return NextResponse.json(
      { error: 'Failed to update historical values' },
      { status: 500 }
    );
  }
} 