import { NextResponse } from 'next/server';
import { PearlActivityStatus, PearlAuditEventType, PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { createPearlAudit, resolveUserFromInitData } from '@/utils/pearls';
import {
  findReceiptRushCategory,
  RECEIPT_RUSH_CATEGORIES,
  RECEIPT_RUSH_REWARD_BLUE,
} from '@/utils/receipt-rush';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    initData,
    categoryId,
    taxType,
    uraPortal,
    receiptNumber,
    receiptDate,
    amountPaid,
    notes,
    imageUrl,
  } = body as Record<string, unknown>;

  const init = typeof initData === 'string' ? initData : '';
  if (!init) return NextResponse.json({ error: 'Missing initData' }, { status: 400 });

  const category = findReceiptRushCategory(String(categoryId || ''));
  if (!category) {
    return NextResponse.json(
      { error: 'Invalid category', categories: RECEIPT_RUSH_CATEGORIES },
      { status: 400 }
    );
  }
  const tax = String(taxType || '').trim();
  if (!tax || !category.taxTypes.includes(tax)) {
    return NextResponse.json({ error: 'Invalid tax type for selected category' }, { status: 400 });
  }

  const portal = String(uraPortal || '').trim().slice(0, 80);
  const receiptNo = String(receiptNumber || '').trim().slice(0, 80);
  const date = String(receiptDate || '').trim().slice(0, 40);
  const amount = Math.max(0, Math.floor(Number(amountPaid || 0)));
  const img = String(imageUrl || '').trim();
  const memo = String(notes || '').trim().slice(0, 180);

  if (!portal || !receiptNo || !date || amount <= 0 || !img.startsWith('/uploads/receipts/')) {
    return NextResponse.json({ error: 'Missing or invalid receipt fields' }, { status: 400 });
  }

  const user = await resolveUserFromInitData(init);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const result = await prisma.$transaction(async (tx) => {
    const sourceLabel = `Receipt Rush · ${category.label} · ${tax} · Portal:${portal} · Ref:${receiptNo} · Date:${date} · Paid:${amount} · Image:${img}${memo ? ` · Notes:${memo}` : ''}`;
    const activity = await tx.pearlActivity.create({
      data: {
        userId: user.id,
        sourceKey: 'receipt_rush',
        sourceLabel: sourceLabel.slice(0, 2000),
        pearlType: PearlType.BLUE,
        amount: RECEIPT_RUSH_REWARD_BLUE,
        status: PearlActivityStatus.PENDING,
        approvedByAdmin: false,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { bluePearlsPending: { increment: RECEIPT_RUSH_REWARD_BLUE } },
    });

    await createPearlAudit(tx, {
      userId: user.id,
      eventType: PearlAuditEventType.EARN_BLUE_PENDING,
      pearlType: PearlType.BLUE,
      amount: RECEIPT_RUSH_REWARD_BLUE,
      meta: {
        sourceKey: 'receipt_rush',
        categoryId: category.id,
        categoryLabel: category.label,
        taxType: tax,
        uraPortal: portal,
        receiptNumber: receiptNo,
        receiptDate: date,
        amountPaid: amount,
        imageUrl: img,
      },
    });

    return activity;
  });

  return NextResponse.json({
    success: true,
    rewardBluePearls: RECEIPT_RUSH_REWARD_BLUE,
    status: 'PENDING_APPROVAL',
    activityId: result.id,
  });
}
