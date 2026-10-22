import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';

export const dynamic = 'force-dynamic';

const MAX_BODY = 2000;

function isMongoObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

type CommentDto = {
  id: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

function mapRow(row: { id: string; authorName: string | null; body: string; createdAt: Date }): CommentDto {
  return {
    id: row.id,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoKey } = await params;
  if (!videoKey) return NextResponse.json({ error: 'Missing video id' }, { status: 400 });
  try {
    const [byKey, legacy] = await Promise.all([
      prisma.uraTvVideoComment.findMany({
        where: { videoKey },
        orderBy: { createdAt: 'desc' },
        take: 80,
        select: { id: true, authorName: true, body: true, createdAt: true },
      }),
      isMongoObjectId(videoKey)
        ? prisma.tvProgramComment.findMany({
            where: { programId: videoKey },
            orderBy: { createdAt: 'desc' },
            take: 80,
            select: { id: true, authorName: true, body: true, createdAt: true },
          })
        : Promise.resolve([]),
    ]);

    const merged = [...byKey.map(mapRow), ...legacy.map(mapRow)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const seen = new Set<string>();
    const comments = merged.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    return NextResponse.json({ comments: comments.slice(0, 80) });
  } catch (e) {
    console.error('[tv-programs comments GET]', e);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoKey } = await params;
  if (!videoKey) return NextResponse.json({ error: 'Missing video id' }, { status: 400 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const initData =
      (typeof body.initData === 'string' ? body.initData : null) ??
      (typeof body.telegramInitData === 'string' ? body.telegramInitData : null);
    const text = typeof body.body === 'string' ? body.body.trim() : '';

    if (!initData) {
      return NextResponse.json({ error: 'Telegram session required to comment' }, { status: 400 });
    }
    if (!text) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    if (text.length > MAX_BODY) {
      return NextResponse.json({ error: `Comment too long (max ${MAX_BODY} characters)` }, { status: 400 });
    }

    const { validatedData, user } = validateTelegramWebAppData(initData);
    if (!validatedData || !user?.id) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
    }

    const telegramId = String(user.id);
    const authorName =
      [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.username ||
      'Citizen';

    if (isMongoObjectId(videoKey)) {
      const program = await prisma.tvProgram.findFirst({
        where: { id: videoKey, isPublished: true },
        select: { id: true },
      });
      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
    }

    const row = await prisma.uraTvVideoComment.create({
      data: {
        videoKey,
        telegramId,
        authorName,
        body: text,
      },
      select: { id: true, authorName: true, body: true, createdAt: true },
    });

    return NextResponse.json({ comment: mapRow(row) });
  } catch (e) {
    console.error('[tv-programs comments POST]', e);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
