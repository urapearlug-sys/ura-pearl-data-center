import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { resolveUserFromInitData } from '@/utils/pearls';
import { isAdminAuthorized } from '@/utils/admin-session';

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const id = params.id;
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const clip = await prisma.voiceRecordingClip.findUnique({ where: { id } });
  if (!clip) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const initData = req.nextUrl.searchParams.get('initData');
  let allowed = isAdminAuthorized(req);
  if (!allowed && initData) {
    const user = await resolveUserFromInitData(initData);
    allowed = user?.id === clip.userId;
  }
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = Buffer.from(clip.dataBase64, 'base64');
  return new NextResponse(body, {
    headers: {
      'Content-Type': clip.mimeType || 'audio/webm',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
