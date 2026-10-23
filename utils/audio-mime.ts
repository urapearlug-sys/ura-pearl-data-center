const ALLOWED_AUDIO_BASE = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'video/webm'];

export function normalizeAudioMime(type: string | undefined): string {
  if (!type || !type.trim()) return 'audio/webm';
  return type.split(';')[0].trim().toLowerCase();
}

export function isAllowedAudioMime(type: string | undefined): boolean {
  const base = normalizeAudioMime(type);
  if (ALLOWED_AUDIO_BASE.includes(base)) return true;
  if (base.startsWith('audio/')) return true;
  return base === 'video/webm';
}
