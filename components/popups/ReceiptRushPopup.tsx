'use client';

import { useMemo, useState } from 'react';
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
  const category = useMemo(
    () => RECEIPT_RUSH_CATEGORIES.find((c) => c.id === categoryId) ?? RECEIPT_RUSH_CATEGORIES[0],
    [categoryId]
  );

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

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 p-4" onClick={onClose}>
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
          <label className="block rounded-lg border border-ura-border/85 bg-ura-panel-2 px-3 py-2 text-sm cursor-pointer">
            Scan receipt (camera)
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)} />
          </label>
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
