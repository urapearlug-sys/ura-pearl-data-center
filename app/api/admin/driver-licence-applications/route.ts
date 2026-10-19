import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

export async function GET(req: NextRequest) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  try {
    const items = await prisma.driverLicenceApplication.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error('[admin/driver-licence-applications]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
