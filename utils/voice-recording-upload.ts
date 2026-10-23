import { normalizeAudioMime } from '@/utils/audio-mime';

export async function uploadVoiceRecording(opts: {
  initData: string;
  blob: Blob;
  purpose: 'voice_report' | 'whistle_blower';
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!opts.blob.size) {
    return { ok: false, error: 'Recording is empty — please record again' };
  }

  const mime = normalizeAudioMime(opts.blob.type);
  const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'm4a' : 'webm';
  const file = new File([opts.blob], `recording.${ext}`, { type: mime });
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', opts.purpose);
  form.append('initData', opts.initData);

  try {
    const res = await fetch('/api/voice-recording/upload', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || `Voice upload failed (${res.status})` };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: 'Network error uploading voice' };
  }
}
