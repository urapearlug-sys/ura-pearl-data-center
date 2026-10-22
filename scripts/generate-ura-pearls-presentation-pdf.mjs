#!/usr/bin/env node
/**
 * Builds docs/URA-PEARLS-System-Presentation.pdf from structured content.
 * Usage: node scripts/generate-ura-pearls-presentation-pdf.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs', 'URA-PEARLS-System-Presentation.pdf');

const NAVY = [18, 63, 120];
const GOLD = [243, 186, 47];
const MUTED = [90, 123, 176];
const WHITE = [255, 255, 255];
const BODY = [26, 66, 127];

const PAGE_W = 210;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const SECTIONS = [
  {
    title: 'Executive summary',
    bullets: [
      'URA PEARLS is a Telegram Mini App for tax education, simulated PRN/payment practice, and reward-based engagement.',
      'Citizens use Learn, Earn, Quick Access, and Ask the Kamisona without installing a separate app.',
      'PEARLS (white, blue, golden) recognise participation; admins manage TV, opportunities, and approvals.',
    ],
  },
  {
    title: 'Purpose',
    bullets: [
      'Increase awareness of TIN, PRN, filing, and payment steps in plain language.',
      'Offer safe simulators before citizens use live URA portals.',
      'Build trust through official URA visual identity and links to ura.go.ug.',
    ],
  },
  {
    title: 'Architecture',
    bullets: [
      'Next.js 14 front end inside Telegram WebView.',
      'API routes + MongoDB via Prisma for notices, TV metadata, user progress.',
      'Telegram initData validation on comments, pearl awards, and sensitive actions.',
    ],
  },
  {
    title: 'Navigation',
    bullets: [
      'Home — Action Center, Total PEARLS (hide/show), Quick Access.',
      'Learn — URA TV, Opportunities (Auctions · Careers · Tenders), URA FC.',
      'Earn — quizzes, True/False, voice reports, ratings, events.',
      'Services & Guild — official links and community.',
    ],
  },
  {
    title: 'Quick Access — Register payment',
    bullets: [
      'Step 1: select tax category; Step 2: URA-style form (Tax Head, TIN, district, period, basis, amount).',
      'Generates simulated PRN slip: PDF, QR, copy, Save slip, or Pay now.',
    ],
  },
  {
    title: 'Quick Access — Pay against PRN',
    bullets: [
      'Lookup registered PRN only; show full registration details.',
      'Choose payment option (mobile money, card, banks); simulated receipt.',
      'History under Profile → Downloads.',
    ],
  },
  {
    title: 'Ask the Kamisona',
    bullets: [
      'In-app AI assistance for common tax questions.',
      'FAQs: Luganda → Buuza Kamisona; English → Commissioner General Q&A on ura.go.ug.',
      'Escalation to Telegram or URA toll-free 0800 117 000.',
    ],
  },
  {
    title: 'Learn — URA TV & Opportunities',
    bullets: [
      'URA TV: upcoming + library from @uratvofficial; comments per video.',
      'Opportunities: five sample notices per tab with title list and detail modal.',
    ],
  },
  {
    title: 'Earn & PEARLS',
    bullets: [
      'White — instant rewards; Blue — pending approval; Golden — approved balance.',
      'True/False: 3 questions, all correct to win; one wrong = no pearls.',
      'Karibu Daily, quizzes, whistle blower, service ratings, and more in-app.',
    ],
  },
  {
    title: 'Administration',
    bullets: [
      'Publish opportunity notices, URA TV programmes, review licence applications.',
      'Approve blue-pearl activities; monitor engagement via existing admin hub.',
    ],
  },
  {
    title: 'Design & compliance',
    bullets: [
      'URA navy and gold UI; short stepped forms; scrollable receipts.',
      'Simulated payments clearly labelled until live URA API integration.',
      'External URA pages open via Telegram-safe links.',
    ],
  },
  {
    title: 'References',
    bullets: [
      'ura.go.ug — Generate a payment slip, Buuza Kamisona, Commissioner General FAQs.',
      'Repository: urapearlug-sys / ura-pearl-data-center.',
    ],
  },
];

function newPage(doc, pageNum) {
  if (pageNum > 1) doc.addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 28, PAGE_W, 2.5, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('URA PEARLS · System presentation', MARGIN, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, 12, { align: 'right' });
  doc.setTextColor(...BODY);
  return 38;
}

function wrap(doc, text, x, y, maxW, lineH = 5.2) {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function main() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let page = 1;
  let y = 0;

  // Cover
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 297, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, 48, CONTENT_W, 1.2, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('URA PEARLS', PAGE_W / 2, 70, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Telegram Mini App', PAGE_W / 2, 82, { align: 'center' });
  doc.setTextColor(...GOLD);
  doc.setFontSize(11);
  doc.text('System overview · Product & capability presentation', PAGE_W / 2, 98, { align: 'center' });
  doc.setTextColor(200, 220, 245);
  doc.setFontSize(10);
  doc.text('Uganda Revenue Authority', PAGE_W / 2, 120, { align: 'center' });
  doc.text('Citizen engagement · Tax education · Simulated payments', PAGE_W / 2, 128, { align: 'center' });
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-UG', { month: 'long', year: 'numeric' }), PAGE_W / 2, 250, {
    align: 'center',
  });
  doc.text('Document: docs/URA-PEARLS-System-Presentation.pdf', PAGE_W / 2, 258, { align: 'center' });

  page = 2;
  y = newPage(doc, page);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  y = wrap(doc, 'At a glance', MARGIN, y, CONTENT_W, 7);
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BODY);
  const glance = [
    'Platform: Telegram Mini App (Next.js 14, MongoDB, Prisma)',
    'Primary users: Ugandan taxpayers and learners',
    'Core flows: Register PRN · Pay PRN · Kamisona · Learn · Earn PEARLS',
    'Status: Production-ready UX with simulated payment integration',
  ];
  for (const line of glance) {
    y = wrap(doc, `• ${line}`, MARGIN + 2, y, CONTENT_W - 4);
    y += 1.5;
    if (y > 270) {
      page++;
      y = newPage(doc, page);
    }
  }
  y += 6;

  for (const section of SECTIONS) {
    if (y > 250) {
      page++;
      y = newPage(doc, page);
    }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    y = wrap(doc, section.title, MARGIN, y, CONTENT_W, 6.5);
    y += 2;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, MARGIN + 40, y);
    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BODY);
    for (const bullet of section.bullets) {
      if (y > 272) {
        page++;
        y = newPage(doc, page);
      }
      y = wrap(doc, `• ${bullet}`, MARGIN + 2, y, CONTENT_W - 6);
      y += 2.5;
    }
    y += 4;
  }

  if (y > 240) {
    page++;
    y = newPage(doc, page);
  }
  doc.setFillColor(244, 248, 255);
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  wrap(
    doc,
    'Simulated payment and PRN flows are for training and demonstration until connected to live URA eTax services. Official tax advice remains on ura.go.ug and through URA service centres.',
    MARGIN + 4,
    y + 8,
    CONTENT_W - 8,
    4.5
  );

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const buf = doc.output('arraybuffer');
  fs.writeFileSync(OUT, Buffer.from(buf));
  console.log(`Wrote ${OUT}`);
}

main();
