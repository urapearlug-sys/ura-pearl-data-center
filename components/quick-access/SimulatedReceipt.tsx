'use client';

import { triggerHapticFeedback } from '@/utils/ui';

export type ReceiptField = { label: string; value: string };

export type SimulatedReceiptData = {
  kind: 'prn-slip' | 'payment';
  title: string;
  subtitle: string;
  fields: ReceiptField[];
  refCode: string;
  issuedAt?: Date;
};

function formatIssuedAt(d: Date) {
  return d.toLocaleString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildReceiptHtml(data: SimulatedReceiptData, issuedAt: Date) {
  const rows = data.fields
    .map(
      (f) =>
        `<tr><td style="padding:8px 0;color:#5a7bb0;font-size:12px;width:40%">${escapeHtml(f.label)}</td><td style="padding:8px 0;color:#123f78;font-size:13px;font-weight:700;text-align:right">${escapeHtml(f.value)}</td></tr>`
    )
    .join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(data.title)} — ${escapeHtml(data.refCode)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;padding:24px;background:#fff;color:#123f78}
  .wrap{max-width:420px;margin:0 auto;border:1px solid #8bb4ef;border-top:4px solid #f3ba2f;border-radius:12px;overflow:hidden}
  .head{background:#123f78;color:#fff;padding:16px 18px}
  .head h1{margin:0;font-size:16px}
  .head p{margin:4px 0 0;font-size:11px;color:#f3ba2f}
  .body{padding:18px}
  table{width:100%;border-collapse:collapse}
  .sim{margin-top:14px;font-size:10px;color:#5a7bb0;text-align:center}
  .ref{margin-top:12px;padding:10px;background:#f4f8ff;border-radius:8px;font-family:ui-monospace,monospace;font-size:12px;text-align:center;font-weight:700}
  @media print{body{padding:0}.wrap{border-radius:0}}
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <h1>Uganda Revenue Authority</h1>
      <p>${escapeHtml(data.title)} · Simulated</p>
    </div>
    <div class="body">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700">${escapeHtml(data.subtitle)}</p>
      <table>${rows}</table>
      <div class="ref">Ref ${escapeHtml(data.refCode)}</div>
      <p class="sim">Issued ${escapeHtml(formatIssuedAt(issuedAt))} · Simulation — not an official URA document</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type Props = {
  data: SimulatedReceiptData;
  onDone: () => void;
};

export default function SimulatedReceipt({ data, onDone }: Props) {
  const issuedAt = data.issuedAt ?? new Date();

  const download = () => {
    triggerHapticFeedback(window);
    const html = buildReceiptHtml(data, issuedAt);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = data.kind === 'payment' ? 'payment-receipt' : 'prn-slip';
    a.href = url;
    a.download = `URA-${slug}-${data.refCode}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const print = () => {
    triggerHapticFeedback(window);
    const html = buildReceiptHtml(data, issuedAt);
    const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
    if (!w) {
      // Popup blocked — try printing the in-dialog receipt area
      window.print();
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onload = () => {
      try {
        w.print();
      } catch {
        /* ignore */
      }
    };
    // Some browsers fire print before onload; retry shortly
    setTimeout(() => {
      try {
        w.print();
      } catch {
        /* ignore */
      }
    }, 250);
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
            Issued {formatIssuedAt(issuedAt)} · Not an official URA document
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={download}
          className="rounded-xl border border-[#8bb4ef]/50 bg-white py-2.5 text-sm font-bold text-[#123f78]"
        >
          Download
        </button>
        <button
          type="button"
          onClick={print}
          className="rounded-xl border border-[#8bb4ef]/50 bg-white py-2.5 text-sm font-bold text-[#123f78]"
        >
          Print
        </button>
      </div>
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
