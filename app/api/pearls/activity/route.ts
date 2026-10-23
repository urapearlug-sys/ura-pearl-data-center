import { NextResponse } from 'next/server';
import { PearlActivityStatus, PearlAuditEventType, PearlType } from '@prisma/client';
import prisma from '@/utils/prisma';
import { createPearlAudit, resolveUserFromInitData } from '@/utils/pearls';

type ActivityType = 'white' | 'blue';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { initData, sourceKey, sourceLabel, amount, activityType, attachmentUrl } = body as {
    initData?: string;
    sourceKey?: string;
    sourceLabel?: string;
    amount?: number;
    activityType?: ActivityType;
    attachmentUrl?: string;
  };

  if (!initData || !sourceKey || !sourceLabel || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  if (activityType !== 'white' && activityType !== 'blue') {
    return NextResponse.json({ error: 'activityType must be white or blue' }, { status: 400 });
  }

  const user = await resolveUserFromInitData(initData);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const amt = Math.floor(Number(amount));
  const pearlType = activityType === 'white' ? PearlType.WHITE : PearlType.BLUE;
  const status = activityType === 'white' ? PearlActivityStatus.APPROVED : PearlActivityStatus.PENDING;
  const safeAttachment =
    typeof attachmentUrl === 'string' && attachmentUrl.startsWith('/uploads/voice-recordings/')
      ? attachmentUrl
      : null;
  const labelWithAttachment = safeAttachment
    ? `${sourceLabel} · 🎤 ${safeAttachment}`
    : sourceLabel;

  const result = await prisma.$transaction(async (tx) => {
    const activity = await tx.pearlActivity.create({
      data: {
        userId: user.id,
        sourceKey,
        sourceLabel: labelWithAttachment,
        pearlType,
        amount: amt,
        status,
        approvedByAdmin: activityType === 'white',
        approvedAt: activityType === 'white' ? new Date() : null,
      },
    });

    if (activityType === 'white') {
      await tx.user.update({
        where: { id: user.id },
        data: { whitePearls: { increment: amt }, pointsBalance: { increment: amt } },
      });
      await createPearlAudit(tx, {
        userId: user.id,
        eventType: PearlAuditEventType.EARN_WHITE,
        pearlType: PearlType.WHITE,
        amount: amt,
        meta: { sourceKey, sourceLabel: labelWithAttachment, attachmentUrl: safeAttachment },
      });
    } else {
      await tx.user.update({
        where: { id: user.id },
        data: { bluePearlsPending: { increment: amt } },
      });
      await createPearlAudit(tx, {
        userId: user.id,
        eventType: PearlAuditEventType.EARN_BLUE_PENDING,
        pearlType: PearlType.BLUE,
        amount: amt,
        meta: { sourceKey, sourceLabel: labelWithAttachment, attachmentUrl: safeAttachment },
      });
    }

    return activity;
  });

  return NextResponse.json({ success: true, activity: result });
}
