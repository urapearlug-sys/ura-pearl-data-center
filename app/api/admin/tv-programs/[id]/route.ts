import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';
import { youtubeEmbedUrlFromInput } from '@/utils/youtube-embed';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await req.json();
    const data: {
      title?: string;
      description?: string | null;
      youtubeUrl?: string;
      scheduledAt?: Date | null;
      sortOrder?: number;
      isPublished?: boolean;
    } = {};

    if (typeof body.title === 'string') data.title = body.title.trim();
    if ('description' in body) {
      data.description =
        typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : null;
    }
    if (typeof body.youtubeUrl === 'string') {
      const u = body.youtubeUrl.trim();
      if (!youtubeEmbedUrlFromInput(u)) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
      }
      data.youtubeUrl = u;
    }
    if ('scheduledAt' in body) {
      if (body.scheduledAt === null || body.scheduledAt === '') data.scheduledAt = null;
      else if (typeof body.scheduledAt === 'string') {
        const d = new Date(body.scheduledAt);
        data.scheduledAt = Number.isNaN(d.getTime()) ? null : d;
      }
    }
    if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
      data.sortOrder = Math.floor(body.sortOrder);
    }
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const row = await prisma.tvProgram.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/tv-programs PATCH]', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.tvProgram.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/tv-programs DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
