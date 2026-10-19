import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function serialize(row: {
  id: string;
  category: string;
  title: string;
  body: string | null;
  link: string | null;
  linkLabel: string | null;
  createdAt: Date;
  sortOrder: number;
}) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    link: row.link,
    linkLabel: row.linkLabel,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Public: published opportunities & tenders (optional ?category=opportunity|tender). */
export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category')?.trim().toLowerCase();
    const where: { isPublished: boolean; category?: string } = { isPublished: true };
    if (category === 'opportunity' || category === 'tender') {
      where.category = category;
    }

    const rows = await prisma.opportunityNotice.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      notices: rows.map(serialize),
      opportunities: rows.filter((r) => r.category === 'opportunity').map(serialize),
      tenders: rows.filter((r) => r.category === 'tender').map(serialize),
    });
  } catch (e) {
    console.error('[opportunity-notices GET]', e);
    return NextResponse.json({ error: 'Failed to load notices' }, { status: 500 });
  }
}
