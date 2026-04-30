import { NextResponse } from 'next/server';
import { PearlAuditEventType, PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { WHITE_TO_GOLDISH_RATE, createPearlAudit, resolveUserFromInitData } from '@/utils/pearls';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { initData, whiteAmount } = body as {
    initData?: string;
    whiteAmount?: number;
  };

  if (!initData || !Number.isFinite(Number(whiteAmount)) || Number(whiteAmount) <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const user = await resolveUserFromInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const requestedWhite = Math.max(1, Math.floor(Number(whiteAmount)));
  if (user.whitePearls < requestedWhite) {
    return NextResponse.json({ error: 'Insufficient white pearls' }, { status: 400 });
  }

  const whiteConsumed = Math.floor(requestedWhite / WHITE_TO_GOLDISH_RATE) * WHITE_TO_GOLDISH_RATE;
  const goldenReceived = Math.floor(whiteConsumed / WHITE_TO_GOLDISH_RATE);
  if (goldenReceived <= 0) {
    return NextResponse.json({ error: 'Need at least 50 white pearls to sell' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        whitePearls: { decrement: whiteConsumed },
        goldishPearls: { increment: goldenReceived },
      },
    });

    await tx.pearlConversion.create({
      data: {
        userId: user.id,
        fromType: PearlType.WHITE,
        toType: PearlType.GOLDISH,
        fromAmount: whiteConsumed,
        toAmount: goldenReceived,
        trigger: 'user_request',
      },
    });

    await createPearlAudit(tx, {
      userId: user.id,
      eventType: PearlAuditEventType.CONVERT_WHITE_TO_GOLDISH,
      pearlType: PearlType.GOLDISH,
      amount: goldenReceived,
      meta: { whiteSold: whiteConsumed, action: 'sell' },
    });
  });

  return NextResponse.json({
    success: true,
    trade: { mode: 'sell', soldWhite: whiteConsumed, receivedGolden: goldenReceived },
  });
}
