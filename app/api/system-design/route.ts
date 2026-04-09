import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import SystemDesign from '@/lib/models/SystemDesign';

// GET /api/system-design — list notes for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const notes = await SystemDesign.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(notes);
}

// POST /api/system-design — create a note
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  if (!body.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const note = await SystemDesign.create({ ...body, userId });
  return NextResponse.json(note, { status: 201 });
}
