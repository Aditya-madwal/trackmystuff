import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Note from '@/lib/models/Note';

// GET /api/notes — list notes for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(notes);
}

// POST /api/notes — create a note
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  if (!body.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const note = await Note.create({ ...body, userId });
  return NextResponse.json(note, { status: 201 });
}
