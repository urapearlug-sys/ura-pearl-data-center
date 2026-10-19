'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { parseReceiptQrText, type ReceiptQrPayload } from '@/utils/receipt-qr';

type Props = {
  onClose: () => void;
  onScanned: (payload: ReceiptQrPayload) => void;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

function getBarcodeDetector(): BarcodeDetectorLike | null {
  const Ctor = (window as unknown as { BarcodeDetector?: new (opts?: { formats?: string[] }) => BarcodeDetectorLike })
    .BarcodeDetector;
  if (!Ctor) return null;
  try {
    return new Ctor({ formats: ['qr_code'] });
  } catch {
    try {
      return new Ctor();
    } catch {
      return null;
    }
  }
}

export default function ReceiptQrScanModal({ onClose, onScanned }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [scanning, setScanning] = useState(true);

  const stopCamera = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleDecoded = useCallback(
    (raw: string) => {
      const payload = parseReceiptQrText(raw);
      if (!payload) {
        setError('Not a URA receipt QR. Try again or enter the reference.');
        return;
      }
      triggerHapticFeedback(window);
      stopCamera();
      onScanned(payload);
    },
    [onScanned, stopCamera]
  );

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      setError(null);
      const detector = getBarcodeDetector();
      if (!detector) {
        setScanning(false);
        setError('Camera QR scan is not supported on this device. Enter the reference below, or upload a QR image.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video);
              const raw = codes[0]?.rawValue?.trim();
              if (raw) {
                handleDecoded(raw);
                return;
              }
            }
          } catch {
            /* keep scanning */
          }
          rafRef.current = requestAnimationFrame(() => {
            void tick();
          });
        };
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      } catch {
        if (!cancelled) {
          setScanning(false);
          setError('Camera permission denied. Enter the reference or upload a QR image.');
        }
      }
    };
    void start();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [handleDecoded, stopCamera]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    triggerHapticFeedback(window);
    setError(null);
    const detector = getBarcodeDetector();
    if (!detector) {
      setError('QR image decode is not supported here. Enter the reference manually.');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      bitmap.close();
      const raw = codes[0]?.rawValue?.trim();
      if (!raw) {
        setError('No QR code found in that image.');
        return;
      }
      handleDecoded(raw);
    } catch {
      setError('Could not read that image.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Scan receipt QR"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#f3ba2f]/40 border-t-[3px] border-t-[#f3ba2f] bg-[#0a1628] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3.5 py-3 bg-[#123f78]">
          <div>
            <p className="text-sm font-extrabold text-white">Scan receipt QR</p>
            <p className="text-[11px] text-[#f3ba2f]">Point at a URA simulated receipt QR</p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              stopCamera();
              onClose();
            }}
            className="rounded-xl border border-[#8bb4ef]/40 px-3 py-1.5 text-sm font-semibold text-blue-50"
          >
            Close
          </button>
        </div>

        <div className="p-3 space-y-3">
          {scanning ? (
            <div className="relative rounded-xl overflow-hidden border border-[#8bb4ef]/40 bg-black aspect-[3/4]">
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
              <div className="absolute inset-8 border-2 border-[#f3ba2f]/80 rounded-xl pointer-events-none" />
            </div>
          ) : null}

          {error ? <p className="text-[11px] text-rose-300 leading-snug">{error}</p> : null}

          <label className="block">
            <span className="text-[11px] font-semibold text-blue-100/80">Upload QR image</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-1 block w-full text-[11px] text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-[#f3ba2f] file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-[#123f78]"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Or type reference code"
              className="flex-1 rounded-xl bg-[#121f35] border border-[#2a4168] px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              disabled={!manual.trim()}
              onClick={() => handleDecoded(manual.trim())}
              className="rounded-xl bg-[#f3ba2f] px-3 text-sm font-extrabold text-[#123f78] disabled:opacity-40"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
