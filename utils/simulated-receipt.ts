export type ReceiptField = { label: string; value: string };

export type SimulatedReceiptKind = 'prn-slip' | 'payment';

export type SimulatedReceiptData = {
  kind: SimulatedReceiptKind;
  title: string;
  subtitle: string;
  fields: ReceiptField[];
  refCode: string;
  issuedAt?: Date | string;
};

export function normalizeIssuedAt(issuedAt?: Date | string): Date {
  if (!issuedAt) return new Date();
  if (issuedAt instanceof Date) return issuedAt;
  const d = new Date(issuedAt);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function formatReceiptIssuedAt(d: Date) {
  return d.toLocaleString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReceiptHtml(data: SimulatedReceiptData, issuedAt?: Date) {
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
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
<meta name="viewport" content="width=device-width, initial-scale=1"/>
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
  @media print{body{padding:8px}.wrap{border-radius:0}}
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
      <p class="sim">Issued ${escapeHtml(formatReceiptIssuedAt(when))} · Simulation — not an official URA document</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildReceiptPlainText(data: SimulatedReceiptData, issuedAt?: Date) {
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const lines = [
    'Uganda Revenue Authority',
    data.title,
    data.subtitle,
    '---',
    ...data.fields.map((f) => `${f.label}: ${f.value}`),
    `Ref: ${data.refCode}`,
    `Issued: ${formatReceiptIssuedAt(when)}`,
    'Simulation — not an official URA document',
  ];
  return lines.join('\n');
}

export function receiptFileBaseName(data: SimulatedReceiptData) {
  const slug = data.kind === 'payment' ? 'payment-receipt' : 'prn-slip';
  const safeRef = data.refCode.replace(/[^\w.-]+/g, '_');
  return `URA-${slug}-${safeRef}`;
}

type TgWebApp = {
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  downloadFile?: (params: { url: string; file_name: string }, cb?: (accepted: boolean) => void) => void;
  platform?: string;
};

function getTelegramWebApp(): TgWebApp | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null
  );
}

/** Print via hidden iframe (works in Telegram WebView better than window.open). */
export function printReceiptHtml(html: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Print receipt');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      return false;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const runPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        try {
          iframe.remove();
        } catch {
          /* ignore */
        }
      }, 1500);
    };

    // Allow layout then print
    setTimeout(runPrint, 300);
    return true;
  } catch {
    return false;
  }
}

export type DownloadReceiptResult = 'shared' | 'downloaded' | 'opened' | 'copied' | 'failed';

function isLikelyTelegramWebView(): boolean {
  const tg = getTelegramWebApp();
  if (tg) return true;
  if (typeof navigator === 'undefined') return false;
  return /Telegram/i.test(navigator.userAgent || '');
}

/**
 * Multi-strategy download for browsers + Telegram Mini App WebViews.
 * Telegram often blocks <a download>; prefer Share / openLink / clipboard.
 */
export async function downloadReceiptFile(
  data: SimulatedReceiptData,
  issuedAt?: Date
): Promise<DownloadReceiptResult> {
  if (typeof window === 'undefined') return 'failed';
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const html = buildReceiptHtml(data, when);
  const text = buildReceiptPlainText(data, when);
  const base = receiptFileBaseName(data);
  const htmlName = `${base}.html`;
  const txtName = `${base}.txt`;
  const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const txtBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const htmlFile = new File([htmlBlob], htmlName, { type: 'text/html' });
  const txtFile = new File([txtBlob], txtName, { type: 'text/plain' });
  const inTelegram = isLikelyTelegramWebView();

  // 1) Native share sheet (best on mobile / Telegram WebView)
  try {
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share) {
      if (nav.canShare?.({ files: [htmlFile] })) {
        await nav.share({ files: [htmlFile], title: htmlName, text: data.title });
        return 'shared';
      }
      if (nav.canShare?.({ files: [txtFile] })) {
        await nav.share({ files: [txtFile], title: txtName, text: data.title });
        return 'shared';
      }
      // Always try share on Telegram even if canShare is missing
      if (inTelegram || nav.canShare?.({ text })) {
        await nav.share({ title: htmlName, text });
        return 'shared';
      }
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
      return 'failed';
    }
  }

  // 2) Classic <a download> (desktop browsers)
  if (!inTelegram) {
    try {
      const url = URL.createObjectURL(htmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = htmlName;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return 'downloaded';
    } catch {
      /* continue */
    }
  }

  // 3) Open blob in a new tab (browser only — Telegram blocks blob/data openLink)
  if (!inTelegram) {
    try {
      const url = URL.createObjectURL(htmlBlob);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (opened) {
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return 'opened';
      }
    } catch {
      /* continue */
    }
  }

  // 5) Clipboard fallback
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    /* continue */
  }

  return 'failed';
}
