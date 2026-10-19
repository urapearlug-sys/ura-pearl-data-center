import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

function parseCategory(raw: unknown): 'opportunity' | 'career' | 'tender' | 'auction' | null {
  if (raw === 'opportunity' || raw === 'career' || raw === 'tender' || raw === 'auction') {
    return raw;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const items = await prisma.opportunityNotice.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error('[admin/opportunity-notices]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const body = await req.json();
    const category = parseCategory(body.category);
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!category) {
      return NextResponse.json(
        { error: 'category must be opportunity, career, tender, or auction' },
        { status: 400 }
      );
    }
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const text =
      typeof body.body === 'string' && body.body.trim() ? body.body.trim() : null;
    const link = typeof body.link === 'string' && body.link.trim() ? body.link.trim() : null;
    const linkLabel =
      typeof body.linkLabel === 'string' && body.linkLabel.trim() ? body.linkLabel.trim() : null;
    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
        ? Math.floor(body.sortOrder)
        : 0;

    const row = await prisma.opportunityNotice.create({
      data: {
        category,
        title,
        body: text,
        link,
        linkLabel,
        sortOrder,
        isPublished: body.isPublished === true,
      },
    });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/opportunity-notices POST]', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
