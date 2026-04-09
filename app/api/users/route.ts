import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

// GET /api/users — list all users
export async function GET() {
  await dbConnect();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

// POST /api/users — create a user
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { clerkId, username, email } = body;

  if (!clerkId || !username || !email) {
    return NextResponse.json({ error: 'clerkId, username, and email are required' }, { status: 400 });
  }

  // Upsert: create if not exists, update if exists
  const user = await User.findOneAndUpdate(
    { clerkId },
    { clerkId, username, email },
    { upsert: true, new: true, runValidators: true }
  );

  return NextResponse.json(user, { status: 201 });
}
