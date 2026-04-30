import { NextResponse } from 'next/server';
import { PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { resolveUserFromInitData } from '@/utils/pearls';

type SwapType = 'white_to_blue' | 'blue_to_white';

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

  const user = await resolveUserFromInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const swapAmount = Math.max(1, Math.floor(Number(amount)));

  if (swapType === 'white_to_blue') {
    if (user.whitePearls < swapAmount) {
      return NextResponse.json({ error: 'Insufficient White pearls' }, { status: 400 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          whitePearls: { decrement: swapAmount },
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

  if (user.bluePearlsPending < swapAmount) {
    return NextResponse.json({ error: 'Insufficient Blue pearls' }, { status: 400 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        bluePearlsPending: { decrement: swapAmount },
        whitePearls: { increment: swapAmount },
      },
    });
    await tx.pearlConversion.create({
      data: {
        userId: user.id,
        fromType: PearlType.BLUE,
        toType: PearlType.WHITE,
        fromAmount: swapAmount,
        toAmount: swapAmount,
        trigger: 'user_request',
      },
    });
  });
  return NextResponse.json({ success: true, swap: { from: 'BLUE', to: 'WHITE', amount: swapAmount } });
}
