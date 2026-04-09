import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/lib/models/Task';

// GET /api/tasks — list tasks for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(tasks);
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  if (!body.title || !body.domain) {
    return NextResponse.json({ error: 'title and domain are required' }, { status: 400 });
  }

  const task = await Task.create({ ...body, userId });
  return NextResponse.json(task, { status: 201 });
}
