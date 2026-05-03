import { NextResponse } from 'next/server';
import { PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { resolveUserFromInitData } from '@/utils/pearls';

type SwapType = 'white_to_blue';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { initData, swapType, amount } = body as {
    initData?: string;
    swapType?: SwapType;
    amount?: number;
  };

  if (!initData || !swapType || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (swapType !== 'white_to_blue') {
    return NextResponse.json(
      { error: 'Blue pearls cannot be swapped back to white. Only white → blue is allowed.' },
      { status: 400 }
    );
  }

  const user = await resolveUserFromInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const swapAmount = Math.max(1, Math.floor(Number(amount)));

  if (user.whitePearls < swapAmount) {
    return NextResponse.json({ error: 'Insufficient White pearls' }, { status: 400 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        whitePearls: { decrement: swapAmount },
        pointsBalance: { decrement: swapAmount },
        bluePearlsPending: { increment: swapAmount },
      },
    });
    await tx.pearlConversion.create({
      data: {
        userId: user.id,
        fromType: PearlType.WHITE,
        toType: PearlType.BLUE,
        fromAmount: swapAmount,
        toAmount: swapAmount,
        trigger: 'user_request',
      },
    });
  });
  return NextResponse.json({ success: true, swap: { from: 'WHITE', to: 'BLUE', amount: swapAmount } });
}
