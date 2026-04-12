import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';

// GET /api/resources
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const resources = await Resource.find({ userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(resources);
}

// POST /api/resources
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await req.json();

  if (!body.title || !body.url) {
    return NextResponse.json({ error: 'title and url are required' }, { status: 400 });
  }

  const resource = await Resource.create({ ...body, userId });
  return NextResponse.json(resource, { status: 201 });
}
