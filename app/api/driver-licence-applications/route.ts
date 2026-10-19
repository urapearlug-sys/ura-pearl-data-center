import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const idNumber = typeof body.idNumber === 'string' ? body.idNumber.trim() : '';
    const licenceType = typeof body.licenceType === 'string' ? body.licenceType.trim() : '';
    const idType = typeof body.idType === 'string' ? body.idType.trim() : 'National ID';
    const tin = typeof body.tin === 'string' && body.tin.trim() ? body.tin.trim() : null;
    const years = typeof body.years === 'number' && Number.isFinite(body.years) ? Math.floor(body.years) : 3;
    const amountUgx =
      typeof body.amountUgx === 'number' && Number.isFinite(body.amountUgx)
        ? Math.max(0, Math.floor(body.amountUgx))
        : 0;

    if (!fullName || !phone || !idNumber || !licenceType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let telegramId: string | null = null;
    if (typeof body.initData === 'string' && body.initData) {
      const v = validateTelegramWebAppData(body.initData);
      if (v.user?.id != null) telegramId = String(v.user.id);
    }

    const row = await prisma.driverLicenceApplication.create({
      data: {
        fullName,
        phone,
        tin,
        idType,
        idNumber,
        licenceType,
        years,
        amountUgx,
        status: 'submitted',
        telegramId,
      },
    });

    return NextResponse.json({
      id: row.id,
      status: row.status,
      amountUgx: row.amountUgx,
      simulated: true,
    });
  } catch (e) {
    console.error('[driver-licence-applications POST]', e);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
