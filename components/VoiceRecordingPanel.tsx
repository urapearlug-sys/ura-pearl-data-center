'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

const MAX_SECONDS = 120;

type Props = {
  recording: Blob | null;
  onRecordingChange: (blob: Blob | null) => void;
  disabled?: boolean;
  label?: string;
};

export default function VoiceRecordingPanel({
  recording,
  onRecordingChange,
  disabled,
  label = 'Voice recording',
}: Props) {
  const [supported, setSupported] = useState(true);
  const [phase, setPhase] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  useEffect(() => {
    if (!recording) {
      setPhase('idle');
      setSeconds(0);
      return;
    }
    setPhase('recorded');
    const url = URL.createObjectURL(recording);
    setPlaybackUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recording]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = useCallback(() => {
    clearTimer();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.requestData();
      } catch {
        /* not all browsers support requestData */
      }
      rec.stop();
    } else stopStream();
  }, []);

  const startRecording = async () => {
    if (disabled || !supported) return;
    try {
      triggerHapticFeedback(window);
      onRecordingChange(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      const mime = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        onRecordingChange(blob.size > 0 ? blob : null);
        setPhase(blob.size > 0 ? 'recorded' : 'idle');
        clearTimer();
      };
      recorder.start(200);
      setPhase('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setSupported(false);
    }
  };

  useEffect(() => () => {
    clearTimer();
    stopStream();
  }, []);

  if (!supported) {
    return (
      <p className="text-[11px] text-amber-200/90 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2">
        Microphone not available in this browser. You can still type your report below.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#8bb4ef]/35 bg-[#121f35]/80 p-3 space-y-2">
      <p className="text-[11px] font-semibold text-[#f3ba2f]">{label}</p>
      <p className="text-[10px] text-blue-200/80">Tap record, speak clearly, then stop. Max {MAX_SECONDS}s.</p>

      {phase === 'recording' ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-mono text-rose-300 animate-pulse">● REC {seconds}s</span>
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg bg-rose-500/90 px-4 py-2 text-xs font-bold text-white"
          >
            Stop
          </button>
        </div>
      ) : phase === 'recorded' && playbackUrl ? (
        <div className="space-y-2">
          <audio controls src={playbackUrl} className="w-full h-10" />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                triggerHapticFeedback(window);
                onRecordingChange(null);
                setPhase('idle');
              }}
              className="flex-1 rounded-lg border border-white/20 py-2 text-xs font-bold"
            >
              Delete
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void startRecording()}
              className="flex-1 rounded-lg border border-[#f3ba2f]/50 py-2 text-xs font-bold text-[#f3ba2f]"
            >
              Re-record
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => void startRecording()}
          className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <span aria-hidden>🎙️</span> Record voice
        </button>
      )}
    </div>
  );
}
