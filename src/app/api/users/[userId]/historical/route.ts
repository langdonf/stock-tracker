import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    const { value } = await request.json();
    const { userId } = await params;

    if (!value || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Valid value is required' },
        { status: 400 }
      );
    }

    // Add new historical value using atomic update
    const updateResult = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          historicalValues: {
            date: new Date(),
            value,
          },
        },
      },
      { new: true }
    );

    if (!updateResult) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updateResult);
  } catch (error) {
    console.error('Error updating historical values:', error);
    return NextResponse.json(
      { error: 'Failed to update historical values' },
      { status: 500 }
    );
  }
} 