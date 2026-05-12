import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';
import { youtubeEmbedUrlFromInput } from '@/utils/youtube-embed';

export async function GET(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const rows = await prisma.tvProgram.findMany({
      orderBy: [{ sortOrder: 'asc' }, { scheduledAt: 'desc' }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error('[admin/tv-programs GET]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const youtubeUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : '';
    const description =
      typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!youtubeUrl) return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    if (!youtubeEmbedUrlFromInput(youtubeUrl)) {
      return NextResponse.json({ error: 'Invalid YouTube URL (use watch, shorts, or youtu.be links)' }, { status: 400 });
    }

    let scheduledAt: Date | null = null;
    if (typeof body.scheduledAt === 'string' && body.scheduledAt.trim()) {
      const d = new Date(body.scheduledAt);
      if (!Number.isNaN(d.getTime())) scheduledAt = d;
    }

    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
        ? Math.floor(body.sortOrder)
        : 0;

    const row = await prisma.tvProgram.create({
      data: {
        title,
        description,
        youtubeUrl,
        scheduledAt,
        sortOrder,
        isPublished: body.isPublished !== false,
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/tv-programs POST]', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
