import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const DEFAULT_USERS = [
  {
    name: 'Langdon',
    cashRemaining: 50,
    portfolio: [],
  },
  {
    name: 'Andy',
    cashRemaining: 50,
    portfolio: [],
  },
  {
    name: `J'aime`,
    cashRemaining: 50,
    portfolio: [],
  },
];

export async function POST() {
  try {
    await connectDB();

    // Delete all existing users
    await User.deleteMany({});

    // Create default users
    const users = await User.create(DEFAULT_USERS);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
