import type { SimulatedReceiptData } from '@/utils/simulated-receipt';
import { formatReceiptIssuedAt, normalizeIssuedAt } from '@/utils/simulated-receipt';

/** Compact payload encoded in receipt QR codes (scan-friendly). */
export type ReceiptQrPayload = {
  v: 1;
  ura: 'sim-receipt';
  kind: SimulatedReceiptData['kind'];
  ref: string;
  title: string;
  fields: Array<{ l: string; v: string }>;
  at: string;
};

export function buildReceiptQrPayload(
  data: SimulatedReceiptData,
  issuedAt?: Date | string
): ReceiptQrPayload {
  const when = normalizeIssuedAt(issuedAt ?? data.issuedAt);
  return {
    v: 1,
    ura: 'sim-receipt',
    kind: data.kind,
    ref: data.refCode,
    title: data.title,
    fields: data.fields.map((f) => ({ l: f.label, v: f.value })),
    at: when.toISOString(),
  };
}

export function buildReceiptQrText(data: SimulatedReceiptData, issuedAt?: Date | string): string {
  return JSON.stringify(buildReceiptQrPayload(data, issuedAt));
}

export function buildReceiptShareText(data: SimulatedReceiptData, issuedAt?: Date | string): string {
  const when = normalizeIssuedAt(issuedAt ?? data.issuedAt);
  const lines = [
    'Uganda Revenue Authority — Simulated receipt',
    data.title,
    data.subtitle,
    ...data.fields.map((f) => `${f.label}: ${f.value}`),
    `Ref: ${data.refCode}`,
    `Issued: ${formatReceiptIssuedAt(when)}`,
  ];
  return lines.join('\n');
}

export async function buildReceiptQrDataUrl(
  data: SimulatedReceiptData,
  issuedAt?: Date | string,
  size = 180
): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  const text = buildReceiptQrText(data, issuedAt);
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: size,
    color: { dark: '#123f78', light: '#ffffff' },
  });
}

export function parseReceiptQrText(raw: string): ReceiptQrPayload | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as Partial<ReceiptQrPayload>;
    if (parsed?.ura === 'sim-receipt' && typeof parsed.ref === 'string' && parsed.v === 1) {
      return parsed as ReceiptQrPayload;
    }
  } catch {
    /* plain ref fallback */
  }
  // Accept bare reference codes
  if (/^(PAY|SLIP|SIM|PRN)[-A-Z0-9]+$/i.test(text) || text.length >= 6) {
    return {
      v: 1,
      ura: 'sim-receipt',
      kind: 'payment',
      ref: text,
      title: 'Scanned receipt',
      fields: [],
      at: new Date().toISOString(),
    };
  }
  return null;
}
