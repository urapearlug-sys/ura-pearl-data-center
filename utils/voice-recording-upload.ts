export async function uploadVoiceRecording(opts: {
  initData: string;
  blob: Blob;
  purpose: 'voice_report' | 'whistle_blower';
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const ext = opts.blob.type.includes('ogg') ? 'ogg' : 'webm';
  const file = new File([opts.blob], `recording.${ext}`, { type: opts.blob.type || 'audio/webm' });
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', opts.purpose);

  try {
    const res = await fetch(`/api/voice-recording/upload?initData=${encodeURIComponent(opts.initData)}`, {
      method: 'POST',
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || 'Voice upload failed' };
    }
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: 'Network error uploading voice' };
  }
}
