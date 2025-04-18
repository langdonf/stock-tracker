import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const users = await User.find({});
  console.log(users);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { name } = await request.json();
  await connectDB();

  const user = await User.create({
    name,
    cashRemaining: 500,
  });

  return NextResponse.json(user);
}
