'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

const MAX_SECONDS = 120;

type Props = {
  recording: Blob | null;
  onRecordingChange: (blob: Blob | null) => void;
  disabled?: boolean;
  /** Shown on aria-label */
  label?: string;
};

export default function HeaderVoiceMicButton({
  recording,
  onRecordingChange,
  disabled,
  label = 'Record voice note',
}: Props) {
  const [supported, setSupported] = useState(true);
  const [recordingActive, setRecordingActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia);
  }, []);

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
    setRecordingActive(false);
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try {
        rec.requestData();
      } catch {
        /* ignore */
      }
      rec.stop();
    } else {
      stopStream();
    }
  }, []);

  const startRecording = async () => {
    if (disabled || !supported) return;
    try {
      triggerHapticFeedback(window);
      onRecordingChange(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
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
        clearTimer();
        setSeconds(0);
      };
      recorder.start(200);
      setRecordingActive(true);
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

  const handleClick = () => {
    if (disabled || !supported) return;
    triggerHapticFeedback(window);
    if (recordingActive) stopRecording();
    else void startRecording();
  };

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    triggerHapticFeedback(window);
    onRecordingChange(null);
  };

  useEffect(
    () => () => {
      clearTimer();
      stopStream();
    },
    [],
  );

  if (!supported) return null;

  const hasClip = recording != null && recording.size > 0;

  return (
    <div className="flex items-center gap-1 shrink-0">
      {recordingActive ? (
        <span className="text-[10px] font-mono text-rose-300 tabular-nums">{seconds}s</span>
      ) : hasClip ? (
        <button
          type="button"
          onClick={handleClear}
          className="text-[10px] text-blue-200/90 px-1 underline"
          aria-label="Remove voice note"
        >
          Clear
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={recordingActive ? 'Stop recording' : label}
        title={recordingActive ? 'Tap to stop' : hasClip ? 'Tap to re-record' : 'Tap to record'}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-lg disabled:opacity-40 ${
          recordingActive
            ? 'border-rose-400 bg-rose-500/25 animate-pulse'
            : hasClip
              ? 'border-emerald-400/70 bg-emerald-500/15'
              : 'border-[#f3ba2f]/50 bg-[#0a1628]/40'
        }`}
      >
        {recordingActive ? '⏹' : hasClip ? '✓' : '🎙️'}
      </button>
    </div>
  );
}
