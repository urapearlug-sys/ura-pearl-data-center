import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { validateTelegramWebAppData } from '@/utils/server-checks';
import { resolveUserFromInitData } from '@/utils/pearls';
import prisma from '@/utils/prisma';
import { isAllowedAudioMime, normalizeAudioMime } from '@/utils/audio-mime';

const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const initData = String(formData.get('initData') || '');
    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }
    const { validatedData } = validateTelegramWebAppData(initData);
    if (!validatedData) {
      return NextResponse.json({ error: 'Invalid Telegram session' }, { status: 403 });
    }
    const user = await resolveUserFromInitData(initData);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    const file = formData.get('file');
    const purpose = String(formData.get('purpose') || 'voice_report');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }
    if (file.size <= 0) {
      return NextResponse.json({ error: 'Recording is empty — record again' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Recording too large (max 8MB)' }, { status: 400 });
    }
    if (!isAllowedAudioMime(file.type)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 400 });
    }

    const mimeType = normalizeAudioMime(file.type);
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataBase64 = bytes.toString('base64');

    const clip = await prisma.voiceRecordingClip.create({
      data: {
        userId: user.id,
        purpose: purpose.slice(0, 64),
        mimeType,
        dataBase64,
        byteSize: bytes.length,
      },
    });

    const playUrl = `/api/voice-recording/play/${clip.id}`;

    try {
      const ext = mimeType.includes('ogg') ? '.ogg' : mimeType.includes('mp4') ? '.m4a' : '.webm';
      const safePurpose = purpose.replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'voice';
      const filename = `${safePurpose}-${clip.id}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice-recordings');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), bytes);
    } catch {
      /* Vercel: filesystem may be read-only; DB clip is enough */
    }

    return NextResponse.json({ url: playUrl, clipId: clip.id });
  } catch (error) {
    console.error('Voice upload error:', error);
    return NextResponse.json({ error: 'Failed to save voice recording' }, { status: 500 });
  }
}
