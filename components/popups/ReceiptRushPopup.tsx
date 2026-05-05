'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/utils/game-mechanics';
import { triggerHapticFeedback } from '@/utils/ui';
import { RECEIPT_RUSH_CATEGORIES, RECEIPT_RUSH_REWARD_BLUE } from '@/utils/receipt-rush';

type Props = {
  onClose: () => void;
};

export default function ReceiptRushPopup({ onClose }: Props) {
  const { userTelegramInitData } = useGameStore();
  const [categoryId, setCategoryId] = useState(RECEIPT_RUSH_CATEGORIES[0]?.id ?? '');
  const [taxType, setTaxType] = useState(RECEIPT_RUSH_CATEGORIES[0]?.taxTypes[0] ?? '');
  const [uraPortal, setUraPortal] = useState('eTax');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const category = useMemo(
    () => RECEIPT_RUSH_CATEGORIES.find((c) => c.id === categoryId) ?? RECEIPT_RUSH_CATEGORIES[0],
    [categoryId]
  );

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const uploadFile = async (file: File) => {
    if (!userTelegramInitData) throw new Error('Open app from Telegram first.');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/receipt-rush/upload?initData=${encodeURIComponent(userTelegramInitData)}`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return String(data.url || '');
  };

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    setMessage('Uploading receipt image...');
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
      setMessage('Receipt image uploaded.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!userTelegramInitData) {
      setMessage('Missing Telegram session. Re-open app from Telegram.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/receipt-rush/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: userTelegramInitData,
          categoryId,
          taxType,
          uraPortal,
          receiptNumber,
          receiptDate,
          amountPaid: Number(amountPaid || 0),
          notes,
          imageUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setMessage(`Submitted for approval. +${RECEIPT_RUSH_REWARD_BLUE} blue pearls pending.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

  const startCameraScan = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported on this device/browser.');
      return;
    }
    setCameraError(null);
    setCameraReady(false);
    try {
      // This call triggers browser permission prompt when needed.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera permission denied or unavailable.';
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return;
    const v = videoRef.current;
    v.srcObject = streamRef.current;
    void v.play().then(() => setCameraReady(true)).catch(() => setCameraReady(false));
  }, [cameraActive]);

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth < 2 || video.videoHeight < 2) {
      setCameraError('Camera is not ready yet. Please wait a second.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Failed to process camera frame.');
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) {
      setCameraError('Failed to capture receipt image.');
      return;
    }
    const file = new File([blob], `receipt-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
    stopCamera();
    await onPickFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 p-4"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-ura-border/85 bg-[#13161d] p-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Receipt Rush</h2>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              stopCamera();
              onClose();
            }}
            className="px-2 py-1 text-xs rounded bg-ura-panel-2 text-gray-300"
          >
            Close
          </button>
        </div>
        <p className="text-xs text-gray-300 mb-3">
          Upload or scan a tax receipt. Approved receipts award <span className="text-[#5fa8ff] font-semibold">+2000 blue pearls</span>.
        </p>

        <label className="text-xs text-gray-400">URA category</label>
        <select
          value={categoryId}
          onChange={(e) => {
            const id = e.target.value;
            setCategoryId(id);
            const selected = RECEIPT_RUSH_CATEGORIES.find((c) => c.id === id);
            setTaxType(selected?.taxTypes[0] ?? '');
          }}
          className="w-full mt-1 mb-2 rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85"
        >
          {RECEIPT_RUSH_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500 mb-2">{category?.description}</p>

        <label className="text-xs text-gray-400">Tax type</label>
        <select
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          className="w-full mt-1 mb-2 rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85"
        >
          {(category?.taxTypes ?? []).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85" placeholder="URA portal (eTax/EFRIS)" value={uraPortal} onChange={(e) => setUraPortal(e.target.value)} />
          <input className="rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85" placeholder="Receipt number" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
          <input className="rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85" placeholder="Receipt date (YYYY-MM-DD)" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
          <input className="rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85" placeholder="Amount paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} inputMode="numeric" />
        </div>

        <textarea
          className="w-full mt-2 rounded-lg bg-ura-panel px-3 py-2 text-sm border border-ura-border/85 min-h-[76px]"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="mt-3 space-y-2">
          <label className="block rounded-lg border border-ura-border/85 bg-ura-panel-2 px-3 py-2 text-sm cursor-pointer">
            Upload receipt image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)} />
          </label>
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              void startCameraScan();
            }}
            className="w-full text-left rounded-lg border border-ura-border/85 bg-ura-panel-2 px-3 py-2 text-sm"
          >
            Scan receipt (camera)
          </button>
          {cameraError ? <p className="text-[11px] text-rose-300">{cameraError}</p> : null}
          {cameraActive ? (
            <div className="rounded-lg border border-ura-border/85 bg-[#0e1118] p-2">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md border border-ura-border/70 bg-black" />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={!cameraReady || busy}
                  onClick={() => void captureFromCamera()}
                  className="flex-1 rounded-md bg-[#5fa8ff] text-[#07111f] font-semibold py-2 disabled:opacity-60"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 rounded-md border border-ura-border/85 bg-ura-panel text-gray-200 py-2"
                >
                  Cancel camera
                </button>
              </div>
            </div>
          ) : null}
          {imageUrl ? <p className="text-[11px] text-emerald-300 break-all">Uploaded: {imageUrl}</p> : null}
        </div>

        {message ? <p className="mt-3 text-xs text-gray-300">{message}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            triggerHapticFeedback(window);
            void submit();
          }}
          className="mt-4 w-full rounded-lg bg-[#5fa8ff] text-[#07111f] font-bold py-2.5 disabled:opacity-60"
        >
          {busy ? 'Please wait...' : 'Submit for approval'}
        </button>
      </div>
    </div>
  );
}
