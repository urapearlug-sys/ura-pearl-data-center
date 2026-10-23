import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { validateTelegramWebAppData } from '@/utils/server-checks';

const ALLOWED_TYPES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'video/webm'];
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const initData = new URL(req.url).searchParams.get('initData');
  if (!initData) {
    return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
  }
  const { validatedData } = validateTelegramWebAppData(initData);
  if (!validatedData) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const purpose = String(formData.get('purpose') || 'voice_report');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Recording too large (max 8MB)' }, { status: 400 });
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported audio format' }, { status: 400 });
    }

    const ext = file.type.includes('ogg') ? '.ogg' : file.type.includes('mp4') ? '.m4a' : '.webm';
    const safePurpose = purpose.replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'voice';
    const filename = `${safePurpose}-${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice-recordings');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/voice-recordings/${filename}` });
  } catch (error) {
    console.error('Voice upload error:', error);
    return NextResponse.json({ error: 'Failed to upload voice recording' }, { status: 500 });
  }
}
