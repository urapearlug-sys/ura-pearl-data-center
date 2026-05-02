// Public: published activity posts for Earn tab (newest first). Validates Telegram initData in production.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { isTelegramAuthBypassed, validateTelegramWebAppData } from '@/utils/server-checks';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('initData');
  const initData = raw?.trim() ?? '';
  const bypass = isTelegramAuthBypassed();

  // In dev/preview bypass, empty initData is OK (browser testing without Telegram WebApp).
  if (!bypass && !initData) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { validatedData } = validateTelegramWebAppData(initData || 'dev-local-bypass');
  if (!validatedData) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
  }

  try {
    const items = await prisma.publishedActivity.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        body: true,
        link: true,
        linkLabel: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      activities: items.map((row) => ({
        ...row,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      })),
    });
  } catch (e) {
    console.error('[published-activities] prisma', e);
    return NextResponse.json({ error: 'Failed to load activities' }, { status: 500 });
  }
}
