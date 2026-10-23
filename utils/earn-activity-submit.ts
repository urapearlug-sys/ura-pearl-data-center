export async function submitEarnPearlActivity(opts: {
  initData: string;
  sourceKey: string;
  sourceLabel: string;
  amount: number;
  activityType: 'white' | 'blue';
  /** Public URL of uploaded voice note, stored in activity label for admin review */
  attachmentUrl?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/pearls/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'Submit failed' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error' };
  }
}
