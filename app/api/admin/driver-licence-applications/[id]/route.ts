import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAdminAuthError } from '@/utils/admin-session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = getAdminAuthError(req);
  if (err) return NextResponse.json(err.body, { status: err.status });
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await req.json();
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    if (!['submitted', 'reviewed', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const row = await prisma.driverLicenceApplication.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(row);
  } catch (e) {
    console.error('[admin/driver-licence-applications PATCH]', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
