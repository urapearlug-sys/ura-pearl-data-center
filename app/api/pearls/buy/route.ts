import { NextResponse } from 'next/server';
import { PearlAuditEventType, PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { WHITE_TO_GOLDISH_RATE, createPearlAudit, resolveUserFromInitData } from '@/utils/pearls';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { initData, goldishAmount } = body as {
    initData?: string;
    goldishAmount?: number;
  };

  if (!initData || !Number.isFinite(Number(goldishAmount)) || Number(goldishAmount) <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const user = await resolveUserFromInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const spendGoldish = Math.max(1, Math.floor(Number(goldishAmount)));
  if (user.goldishPearls < spendGoldish) {
    return NextResponse.json({ error: 'Insufficient golden pearls' }, { status: 400 });
  }

  const buyWhite = spendGoldish * WHITE_TO_GOLDISH_RATE;
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        goldishPearls: { decrement: spendGoldish },
        whitePearls: { increment: buyWhite },
      },
    });

    await tx.pearlConversion.create({
      data: {
        userId: user.id,
        fromType: PearlType.GOLDISH,
        toType: PearlType.WHITE,
        fromAmount: spendGoldish,
        toAmount: buyWhite,
        trigger: 'user_request',
      },
    });

    await createPearlAudit(tx, {
      userId: user.id,
      eventType: PearlAuditEventType.CONVERT_GOLDISH_TO_WHITE,
      pearlType: PearlType.WHITE,
      amount: buyWhite,
      meta: { goldenSpent: spendGoldish, action: 'buy' },
    });
  });

  return NextResponse.json({
    success: true,
    trade: { mode: 'buy', spentGolden: spendGoldish, receivedWhite: buyWhite },
  });
}
