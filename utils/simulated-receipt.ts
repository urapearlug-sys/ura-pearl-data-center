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

/** Markup suitable for same-document @media print (no full HTML document). */
export function buildReceiptPrintMarkup(
  data: SimulatedReceiptData,
  issuedAt?: Date,
  qrDataUrl?: string | null
) {
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const rows = data.fields
    .map(
      (f) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #e5eefc;font-size:12px"><span style="color:#5a7bb0">${escapeHtml(f.label)}</span><span style="color:#123f78;font-weight:700;text-align:right">${escapeHtml(f.value)}</span></div>`
    )
    .join('');
  const qrBlock = qrDataUrl
    ? `<div style="margin-top:14px;text-align:center"><img src="${qrDataUrl}" alt="Receipt QR" width="120" height="120" style="display:inline-block;border:1px solid #8bb4ef;border-radius:8px;padding:4px;background:#fff"/><div style="margin-top:6px;font-size:10px;color:#5a7bb0">Scan QR to verify</div></div>`
    : '';
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#123f78;max-width:480px;margin:0 auto;border:1px solid #8bb4ef;border-top:4px solid #f3ba2f;overflow:hidden">
      <div style="background:#123f78;color:#fff;padding:16px 18px">
        <div style="font-size:16px;font-weight:800">Uganda Revenue Authority</div>
        <div style="margin-top:4px;font-size:11px;color:#f3ba2f">${escapeHtml(data.title)} · Simulated</div>
      </div>
      <div style="padding:18px;background:#fff">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">${escapeHtml(data.subtitle)}</div>
        ${rows}
        <div style="margin-top:14px;padding:10px;background:#f4f8ff;border-radius:8px;text-align:center;font-family:ui-monospace,monospace;font-size:12px;font-weight:700">Ref ${escapeHtml(data.refCode)}</div>
        ${qrBlock}
        <div style="margin-top:12px;font-size:10px;color:#5a7bb0;text-align:center">Issued ${escapeHtml(formatReceiptIssuedAt(when))} · Simulation — not an official URA document</div>
      </div>
    </div>
  `;
}

export function receiptFileBaseName(data: SimulatedReceiptData) {
  const slug = data.kind === 'payment' ? 'payment-receipt' : 'prn-slip';
  const safeRef = data.refCode.replace(/[^\w.-]+/g, '_');
  return `URA-${slug}-${safeRef}`;
}

type TgWebApp = {
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  platform?: string;
};

function getTelegramWebApp(): TgWebApp | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp ?? null
  );
}

function isLikelyTelegramWebView(): boolean {
  if (getTelegramWebApp()) return true;
  if (typeof navigator === 'undefined') return false;
  return /Telegram/i.test(navigator.userAgent || '');
}

/** Build a real PDF blob with jsPDF (includes QR). */
export async function buildReceiptPdfBlob(
  data: SimulatedReceiptData,
  issuedAt?: Date
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { buildReceiptQrDataUrl } = await import('@/utils/receipt-qr');
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 48;

  // Header bar
  doc.setFillColor(18, 63, 120);
  doc.rect(0, 0, pageW, 72, 'F');
  doc.setFillColor(243, 186, 47);
  doc.rect(0, 72, pageW, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Uganda Revenue Authority', margin, 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(243, 186, 47);
  doc.text(`${data.title} · Simulated`, margin, 52);

  y = 100;
  doc.setTextColor(18, 63, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(data.subtitle, margin, y);
  y += 22;

  doc.setDrawColor(139, 180, 239);
  doc.setLineWidth(0.5);

  for (const field of data.fields) {
    if (y > 740) {
      doc.addPage();
      y = 48;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 123, 176);
    doc.text(field.label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(18, 63, 120);
    const valueLines = doc.splitTextToSize(field.value, contentW * 0.55);
    doc.text(valueLines, pageW - margin, y, { align: 'right' });
    const blockH = Math.max(14, valueLines.length * 12);
    y += blockH;
    doc.setDrawColor(229, 238, 252);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
  }

  y += 8;
  doc.setFillColor(244, 248, 255);
  doc.rect(margin, y, contentW, 40, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 123, 176);
  doc.text('REFERENCE', pageW / 2, y + 14, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(18, 63, 120);
  doc.text(data.refCode, pageW / 2, y + 30, { align: 'center' });
  y += 56;

  try {
    const qrDataUrl = await buildReceiptQrDataUrl(data, when, 160);
    const qrSize = 96;
    if (y + qrSize + 40 > 780) {
      doc.addPage();
      y = 48;
    }
    doc.addImage(qrDataUrl, 'PNG', (pageW - qrSize) / 2, y, qrSize, qrSize);
    y += qrSize + 14;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 123, 176);
    doc.text('Scan QR to verify this simulated receipt', pageW / 2, y, { align: 'center' });
    y += 16;
  } catch {
    /* QR optional */
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 123, 176);
  doc.text(
    `Issued ${formatReceiptIssuedAt(when)} · Simulation — not an official URA document`,
    pageW / 2,
    y,
    { align: 'center' }
  );

  return doc.output('blob');
}

const PRINT_ROOT_ID = 'ura-print-receipt-root';
const PRINT_STYLE_ID = 'ura-print-receipt-style';

function ensurePrintStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      body.ura-printing-receipt * {
        visibility: hidden !important;
      }
      body.ura-printing-receipt #${PRINT_ROOT_ID},
      body.ura-printing-receipt #${PRINT_ROOT_ID} * {
        visibility: visible !important;
      }
      body.ura-printing-receipt #${PRINT_ROOT_ID} {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 16px !important;
        background: #fff !important;
        z-index: 2147483647 !important;
      }
    }
    #${PRINT_ROOT_ID} {
      position: fixed;
      left: -10000px;
      top: 0;
      width: 480px;
      background: #fff;
      z-index: -1;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

export type PrintReceiptResult = 'printed' | 'saved-pdf' | 'failed';

/**
 * Same-window print. In Telegram WebViews (where print dialogs are often blocked),
 * falls back to saving/sharing a PDF so the user still gets a printable file.
 */
export async function printReceiptDocument(
  data: SimulatedReceiptData,
  issuedAt?: Date
): Promise<PrintReceiptResult> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'failed';

  // Telegram Mini App WebViews frequently ignore window.print() — give a PDF instead
  if (isLikelyTelegramWebView()) {
    const saved = await downloadReceiptFile(data, issuedAt);
    if (saved === 'failed') return 'failed';
    return 'saved-pdf';
  }

  let qrDataUrl: string | null = null;
  try {
    const { buildReceiptQrDataUrl } = await import('@/utils/receipt-qr');
    qrDataUrl = await buildReceiptQrDataUrl(data, issuedAt, 160);
  } catch {
    qrDataUrl = null;
  }

  return new Promise((resolve) => {
    try {
      ensurePrintStyles();
      document.getElementById(PRINT_ROOT_ID)?.remove();

      const root = document.createElement('div');
      root.id = PRINT_ROOT_ID;
      root.setAttribute('aria-hidden', 'true');
      root.innerHTML = buildReceiptPrintMarkup(data, issuedAt, qrDataUrl);
      document.body.appendChild(root);
      document.body.classList.add('ura-printing-receipt');

      let settled = false;
      const cleanup = (result: PrintReceiptResult) => {
        if (settled) return;
        settled = true;
        document.body.classList.remove('ura-printing-receipt');
        root.remove();
        window.removeEventListener('afterprint', onAfterPrint);
        resolve(result);
      };
      const onAfterPrint = () => cleanup('printed');
      window.addEventListener('afterprint', onAfterPrint);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            window.focus();
            window.print();
          } catch {
            cleanup('failed');
            return;
          }
          // If afterprint never fires, still treat as attempted print
          setTimeout(() => cleanup('printed'), 2000);
        });
      });
    } catch {
      resolve('failed');
    }
  });
}

/** @deprecated use printReceiptDocument */
export function printReceiptHtml(_html: string): boolean {
  // Kept for callers that still pass HTML; prefer printReceiptDocument.
  return false;
}

export type DownloadReceiptResult = 'shared' | 'downloaded' | 'opened' | 'failed';

function triggerAnchorDownload(blob: Blob, fileName: string): boolean {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate PDF and download (or share on Telegram).
 */
export async function downloadReceiptFile(
  data: SimulatedReceiptData,
  issuedAt?: Date
): Promise<DownloadReceiptResult> {
  if (typeof window === 'undefined') return 'failed';
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const fileName = `${receiptFileBaseName(data)}.pdf`;
  const pdfBlob = await buildReceiptPdfBlob(data, when);
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
  const inTelegram = isLikelyTelegramWebView();
  const nav = navigator as Navigator & {
    canShare?: (d: ShareData) => boolean;
    share?: (d: ShareData) => Promise<void>;
  };

  // On Telegram / mobile: Share sheet with the PDF file (Save to Files)
  if (inTelegram && nav.share) {
    try {
      if (!nav.canShare || nav.canShare({ files: [pdfFile] })) {
        await nav.share({ files: [pdfFile], title: fileName, text: data.title });
        return 'shared';
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
        return 'failed';
      }
    }
  }

  // Desktop / regular browser: force PDF file download
  if (triggerAnchorDownload(pdfBlob, fileName)) {
    return 'downloaded';
  }

  // Share fallback (desktop with share support)
  try {
    if (nav.share && nav.canShare?.({ files: [pdfFile] })) {
      await nav.share({ files: [pdfFile], title: fileName, text: data.title });
      return 'shared';
    }
  } catch {
    /* continue */
  }

  // Open PDF in a new tab as last resort
  try {
    const url = URL.createObjectURL(pdfBlob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) {
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return 'opened';
    }
  } catch {
    /* continue */
  }

  return 'failed';
}

export type ShareReceiptResult = 'shared' | 'copied' | 'telegram' | 'failed';

/** Explicit Share action — PDF file when possible, else text / Telegram share URL. */
export async function shareReceiptFile(
  data: SimulatedReceiptData,
  issuedAt?: Date
): Promise<ShareReceiptResult> {
  if (typeof window === 'undefined') return 'failed';
  const when = issuedAt ?? normalizeIssuedAt(data.issuedAt);
  const { buildReceiptShareText } = await import('@/utils/receipt-qr');
  const text = buildReceiptShareText(data, when);
  const fileName = `${receiptFileBaseName(data)}.pdf`;
  const nav = navigator as Navigator & {
    canShare?: (d: ShareData) => boolean;
    share?: (d: ShareData) => Promise<void>;
  };

  try {
    const pdfBlob = await buildReceiptPdfBlob(data, when);
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    if (nav.share && (!nav.canShare || nav.canShare({ files: [pdfFile] }))) {
      await nav.share({ files: [pdfFile], title: data.title, text });
      return 'shared';
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
      return 'failed';
    }
  }

  try {
    if (nav.share) {
      await nav.share({ title: data.title, text });
      return 'shared';
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
      return 'failed';
    }
  }

  // Telegram share URL (text)
  try {
    const tg = getTelegramWebApp();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(data.refCode)}&text=${encodeURIComponent(text)}`;
    if (tg?.openLink) {
      tg.openLink(shareUrl, { try_instant_view: false });
      return 'telegram';
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    return 'telegram';
  } catch {
    /* continue */
  }

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
