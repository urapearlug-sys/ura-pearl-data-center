// Public: published activity posts for Earn tab (newest first). Read-only list is public (no Telegram gate)
// so announcements load even if initData is missing or stale; admin routes protect creates/updates.

import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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
