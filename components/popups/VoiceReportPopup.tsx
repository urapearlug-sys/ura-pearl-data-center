'use client';

import { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { submitEarnPearlActivity } from '@/utils/earn-activity-submit';
import { uploadVoiceRecording } from '@/utils/voice-recording-upload';
import VoiceRecordingPanel from '@/components/VoiceRecordingPanel';

const REWARD_BLUE = 500;

type Props = { onClose: () => void };

export default function VoiceReportPopup({ onClose }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const [topic, setTopic] = useState('Taxpayer experience');
  const [notes, setNotes] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const hasNotes = notes.trim().length >= 12;
    const hasVoice = voiceBlob != null && voiceBlob.size > 0;
    if (!hasNotes && !hasVoice) {
      showToast('Record a voice message or add a short summary (12+ characters)', 'error');
      return;
    }
    if (!userTelegramInitData) {
      showToast('Open from Telegram to submit', 'error');
      return;
    }
    setBusy(true);
    triggerHapticFeedback(window);

    let attachmentUrl: string | undefined;
    if (hasVoice && voiceBlob) {
      const up = await uploadVoiceRecording({
        initData: userTelegramInitData,
        blob: voiceBlob,
        purpose: 'voice_report',
      });
      if (!up.ok) {
        setBusy(false);
        showToast(up.error, 'error');
        return;
      }
      attachmentUrl = up.url;
    }

    const res = await submitEarnPearlActivity({
      initData: userTelegramInitData,
      sourceKey: 'voice_report',
      sourceLabel: `Voice report · ${topic}${hasNotes ? `: ${notes.trim().slice(0, 80)}` : ' · audio only'}`,
      amount: REWARD_BLUE,
      activityType: 'blue',
      attachmentUrl,
    });
    setBusy(false);
    if (!res.ok) {
      showToast(res.error, 'error');
      return;
    }
    setDone(true);
    showToast('Submitted for approval · +500 blue pending', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#123f78] shrink-0">
          <div>
            <p className="text-sm font-extrabold text-white">Voice reports</p>
            <p className="text-[11px] text-[#f3ba2f]">Record or type · +{REWARD_BLUE} blue pending</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-white">
            Close
          </button>
        </div>
        <div className="p-4 space-y-3 text-white overflow-y-auto flex-1">
          {done ? (
            <div className="text-center space-y-2">
              <p className="font-extrabold">Report submitted</p>
              <p className="text-xs text-blue-100">Pending admin approval for blue pearls.</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]">
                Done
              </button>
            </div>
          ) : (
            <>
              <label className="block text-xs text-blue-100">
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm"
                >
                  {['Taxpayer experience', 'Service desk', 'Payment issue', 'EFRIS / invoice', 'Other'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <VoiceRecordingPanel
                label="Record your report"
                recording={voiceBlob}
                onRecordingChange={setVoiceBlob}
                disabled={busy}
              />

              <label className="block text-xs text-blue-100">
                Optional written summary
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Or summarise what you said in the recording…"
                  className="mt-1 w-full rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm resize-none"
                />
              </label>
              <p className="text-[10px] text-slate-400">Submit a voice recording, a written summary, or both. Admin reviews blue pearl rewards.</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-50"
              >
                {busy ? 'Uploading…' : 'Submit for approval'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
