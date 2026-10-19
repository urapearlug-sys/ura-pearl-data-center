'use client';

import { useEffect, useRef, useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import {
  downloadReceiptFile,
  normalizeIssuedAt,
  printReceiptDocument,
  type SimulatedReceiptData,
} from '@/utils/simulated-receipt';
import {
  resolvePaymentActivityUserKey,
  savePaymentActivity,
} from '@/utils/payment-activity-storage';

export type { SimulatedReceiptData, ReceiptField } from '@/utils/simulated-receipt';

type Props = {
  data: SimulatedReceiptData;
  onDone: () => void;
  /** When false, do not write to profile downloads history (e.g. re-viewing). Default true. */
  persist?: boolean;
};

export default function SimulatedReceipt({ data, onDone, persist = true }: Props) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const issuedAt = normalizeIssuedAt(data.issuedAt);
  const savedRef = useRef(false);
  const [busy, setBusy] = useState<'download' | 'print' | null>(null);

  useEffect(() => {
    if (!persist || savedRef.current) return;
    savedRef.current = true;
    const userKey = resolvePaymentActivityUserKey(userTelegramInitData);
    savePaymentActivity(userKey, {
      kind: data.kind,
      title: data.title,
      subtitle: data.subtitle,
      fields: data.fields,
      refCode: data.refCode,
      issuedAt: issuedAt.toISOString(),
    });
  }, [persist, data, issuedAt, userTelegramInitData]);

  const download = async () => {
    if (busy) return;
    setBusy('download');
    triggerHapticFeedback(window);
    try {
      const result = await downloadReceiptFile(data, issuedAt);
      if (result === 'shared') showToast('PDF ready — save it from the share sheet', 'success');
      else if (result === 'downloaded') showToast('PDF receipt downloaded', 'success');
      else if (result === 'opened') showToast('PDF opened — use Save in the viewer', 'success');
      else showToast('Could not download PDF. Try Print → Save as PDF.', 'error');
    } catch {
      showToast('Could not download PDF. Try Print → Save as PDF.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const print = async () => {
    if (busy) return;
    setBusy('print');
    triggerHapticFeedback(window);
    try {
      const result = await printReceiptDocument(data, issuedAt);
      if (result === 'printed') showToast('Print dialog opened', 'success');
      else if (result === 'saved-pdf') {
        showToast('Print unavailable in Telegram — PDF saved instead', 'success');
      } else {
        showToast('Print blocked. Try Download PDF instead.', 'error');
      }
    } catch {
      showToast('Print blocked. Try Download PDF instead.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 px-3 py-3 text-center">
        <p className="text-2xl" aria-hidden>
          ✅
        </p>
        <p className="text-sm font-extrabold text-[#123f78]">{data.title}</p>
        <p className="text-[11px] text-[#335f97] mt-0.5">{data.subtitle}</p>
      </div>

      <div className="rounded-xl border border-[#8bb4ef]/50 border-t-[3px] border-t-[#f3ba2f] bg-white overflow-hidden">
        <div className="bg-[#123f78] px-3.5 py-2.5">
          <p className="text-xs font-extrabold text-white tracking-wide">Uganda Revenue Authority</p>
          <p className="text-[10px] text-[#f3ba2f] mt-0.5">
            {data.kind === 'payment' ? 'Payment receipt' : 'Payment registration slip'} · Simulated
          </p>
        </div>
        <div className="px-3.5 py-3 space-y-2">
          {data.fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-3 text-xs">
              <span className="text-[#5a7bb0] shrink-0">{f.label}</span>
              <span className="font-bold text-[#123f78] text-right break-all">{f.value}</span>
            </div>
          ))}
          <div className="mt-2 rounded-lg bg-[#f4f8ff] px-2.5 py-2 text-center">
            <p className="text-[10px] text-[#5a7bb0] uppercase tracking-wide">Reference</p>
            <p className="text-sm font-mono font-bold text-[#123f78]">{data.refCode}</p>
          </div>
          <p className="text-[10px] text-center text-[#5a7bb0]">
            Issued {issuedAt.toLocaleString('en-UG')} · Not an official URA document
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void download()}
          className="rounded-xl border border-[#8bb4ef]/50 bg-white py-2.5 text-sm font-bold text-[#123f78] disabled:opacity-50"
        >
          {busy === 'download' ? 'Saving…' : 'Download'}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void print()}
          className="rounded-xl border border-[#8bb4ef]/50 bg-white py-2.5 text-sm font-bold text-[#123f78] disabled:opacity-50"
        >
          {busy === 'print' ? 'Printing…' : 'Print'}
        </button>
      </div>
      <p className="text-[10px] text-center text-[#5a7bb0]">
        Downloads as PDF. Also saved under Profile → Downloads.
      </p>
      <button
        type="button"
        onClick={() => {
          triggerHapticFeedback(window);
          onDone();
        }}
        className="w-full rounded-xl bg-[#f3ba2f] py-2.5 text-sm font-extrabold text-[#123f78]"
      >
        Done
      </button>
    </div>
  );
}
