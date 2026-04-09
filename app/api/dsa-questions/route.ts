import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import DSAQuestion from '@/lib/models/DSAQuestion';

// GET /api/dsa-questions — list questions for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const questions = await DSAQuestion.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(questions);
}

// POST /api/dsa-questions — create a question
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  if (!body.title || !body.difficulty) {
    return NextResponse.json({ error: 'title and difficulty are required' }, { status: 400 });
  }

  const question = await DSAQuestion.create({ ...body, userId });
  return NextResponse.json(question, { status: 201 });
}
