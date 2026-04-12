import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Resource from '@/lib/models/Resource';

// GET /api/resources/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const resource = await Resource.findOne({ _id: id, userId }).lean();
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(resource);
}

// PATCH /api/resources/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const resource = await Resource.findOneAndUpdate(
    { _id: id, userId },
    body,
    { new: true, runValidators: true }
  ).lean();
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(resource);
}

// DELETE /api/resources/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const resource = await Resource.findOneAndDelete({ _id: id, userId }).lean();
  if (!resource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
