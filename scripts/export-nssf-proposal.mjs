#!/usr/bin/env node
/**
 * NSSF SaveQuest Proposal — Export Script
 * Generates HTML, Word (.docx), and PDF from markdown sources.
 *
 * Usage: npm run export:nssf-proposal
 * Requires: npm install (devDependencies: marked, docx, md-to-pdf)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const MD_DIR = path.join(ROOT, 'docs/nssf-proposal/markdown');
const EXPORT_DIR = path.join(ROOT, 'docs/nssf-proposal/export');
const HTML_DIR = path.join(EXPORT_DIR, 'html');
const DOCX_DIR = path.join(EXPORT_DIR, 'docx');
const PDF_DIR = path.join(EXPORT_DIR, 'pdf');

const DOCS = [
  { file: 'NSSF_SAVEQUEST_EXCO_SUMMARY.md', title: 'EXCO Summary (1 Page)', short: 'EXCO-Summary' },
  { file: 'NSSF_SAVEQUEST_BUDGET.md', title: 'Part A — Project Budget', short: 'Budget' },
  { file: 'NSSF_SAVEQUEST_PROTOTYPE_PAPER.md', title: 'Part B — Prototype Paper', short: 'Prototype-Paper' },
  { file: 'NSSF_SAVEQUEST_PROTOTYPE_DECK_OUTLINE.md', title: 'Prototype Deck Outline', short: 'Deck-Outline' },
  { file: 'NSSF_SAVEQUEST_BUSINESS_PLAN.md', title: 'Part C — Business Plan', short: 'Business-Plan' },
  { file: 'NSSF_SAVEQUEST_APPENDIX.md', title: 'Appendix — Reference Data', short: 'Appendix' },
];

const CSS = `
  :root {
    --nssf-green: #0B5D3B;
    --nssf-green-dark: #084A2F;
    --nssf-gold: #C9A227;
    --nssf-navy: #1A2744;
    --text: #1a1a1a;
    --muted: #555;
    --border: #d0d7de;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: var(--text);
    max-width: 210mm;
    margin: 0 auto;
    padding: 20mm 18mm;
    background: #fff;
  }
  .cover {
    text-align: center;
    padding: 40mm 10mm 30mm;
    border-bottom: 4px solid var(--nssf-gold);
    margin-bottom: 24pt;
    page-break-after: always;
  }
  .cover .org { font-size: 14pt; color: var(--nssf-green); font-weight: 700; letter-spacing: 0.05em; }
  .cover h1 { font-size: 26pt; color: var(--nssf-navy); margin: 16pt 0 8pt; line-height: 1.2; }
  .cover .subtitle { font-size: 13pt; color: var(--muted); margin-bottom: 24pt; }
  .cover .meta { font-size: 10pt; color: var(--muted); }
  .cover .tagline { font-size: 12pt; color: var(--nssf-gold); font-weight: 600; margin-top: 20pt; }
  .header-bar {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid var(--nssf-green);
    padding-bottom: 8pt; margin-bottom: 20pt;
    font-size: 9pt; color: var(--muted);
  }
  .header-bar strong { color: var(--nssf-green); }
  h1 { font-size: 20pt; color: var(--nssf-navy); border-bottom: 2px solid var(--nssf-gold); padding-bottom: 6pt; margin-top: 24pt; }
  h2 { font-size: 14pt; color: var(--nssf-green); margin-top: 20pt; }
  h3 { font-size: 12pt; color: var(--nssf-navy); margin-top: 16pt; }
  h4 { font-size: 11pt; color: var(--nssf-green-dark); }
  p { margin: 8pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
  th { background: var(--nssf-green); color: #fff; padding: 8pt 10pt; text-align: left; font-weight: 600; }
  td { border: 1px solid var(--border); padding: 7pt 10pt; vertical-align: top; }
  tr:nth-child(even) td { background: #f6f9f7; }
  code, pre { background: #f0f4f2; border-radius: 4px; font-size: 9pt; }
  pre { padding: 12pt; overflow-x: auto; white-space: pre-wrap; border-left: 4px solid var(--nssf-gold); }
  blockquote { border-left: 4px solid var(--nssf-gold); margin: 12pt 0; padding: 8pt 16pt; background: #faf8f0; color: var(--muted); }
  ul, ol { margin: 8pt 0; padding-left: 20pt; }
  li { margin: 4pt 0; }
  hr { border: none; border-top: 1px solid var(--border); margin: 20pt 0; }
  a { color: var(--nssf-green); }
  .confidential {
    background: #fff3cd; border: 1px solid var(--nssf-gold); padding: 8pt 12pt;
    font-size: 9pt; text-align: center; margin-top: 24pt; border-radius: 4px;
  }
  .footer-note { font-size: 8pt; color: var(--muted); text-align: center; margin-top: 30pt; border-top: 1px solid var(--border); padding-top: 10pt; }
  @media print {
    body { padding: 15mm 15mm; }
    .no-print { display: none; }
    h1, h2, h3 { page-break-after: avoid; }
    table, pre, blockquote { page-break-inside: avoid; }
    tr { page-break-inside: avoid; }
  }
  @page { margin: 15mm; }
`;

function ensureDirs() {
  for (const d of [HTML_DIR, DOCX_DIR, PDF_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function readMarkdown(filename) {
  const p = path.join(MD_DIR, filename);
  if (!fs.existsSync(p)) throw new Error(`Missing: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

function buildHtml(title, bodyHtml, isExco = false) {
  const coverClass = isExco ? 'cover exco-cover' : 'cover';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — NSSF SaveQuest</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="${coverClass}">
    <div class="org">NATIONAL SOCIAL SECURITY FUND · UGANDA</div>
    <h1>NSSF SaveQuest</h1>
    <div class="subtitle">${title}</div>
    <div class="tagline">#WeBelieveInU · Save For Your Dream</div>
    <div class="meta">Prepared for NSSF Uganda · www.nssfug.org<br/>June 2026 · Confidential</div>
  </div>
  <div class="header-bar">
    <span><strong>NSSF SaveQuest</strong> · ${title}</span>
    <span>Confidential · June 2026</span>
  </div>
  <main>${bodyHtml}</main>
  <div class="confidential">CONFIDENTIAL — For NSSF Internal Review Only. Not for public distribution without written approval.</div>
  <div class="footer-note">NSSF SaveQuest Proposal · Generated ${new Date().toISOString().slice(0, 10)} · URAPearls Platform Adaptation</div>
  <p class="no-print" style="margin-top:24pt;padding:12pt;background:#e8f5ee;border-radius:6px;font-size:10pt;">
    <strong>Export tip:</strong> Open in Chrome/Edge → File → Print → Save as PDF. Or open this file in Microsoft Word → Save As → .docx
  </p>
</body>
</html>`;
}

function mdToHtml(md) {
  marked.setOptions({ gfm: true, breaks: false });
  return marked.parse(md);
}

function mdToDocxParagraphs(md) {
  const lines = md.split('\n');
  const paragraphs = [];
  let inCode = false;
  let codeBuffer = [];

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: codeBuffer.join('\n'), font: 'Courier New', size: 18 })],
          spacing: { before: 120, after: 120 },
        }));
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }

    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 120 } }));
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 } }));
    } else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 } }));
    } else if (line.startsWith('#### ')) {
      paragraphs.push(new Paragraph({ text: line.slice(5), heading: HeadingLevel.HEADING_4, spacing: { before: 140, after: 60 } }));
    } else if (line.startsWith('|') && line.includes('|')) {
      // skip table rows in simple converter — tables preserved in HTML/PDF
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(new Paragraph({ text: line.slice(2), bullet: { level: 0 }, spacing: { after: 60 } }));
    } else if (line.trim() === '---') {
      paragraphs.push(new Paragraph({ text: '', spacing: { before: 120, after: 120 } }));
    } else if (line.trim()) {
      const cleaned = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: cleaned, size: 22 })],
        spacing: { after: 80 },
      }));
    }
  }
  return paragraphs;
}

async function exportDocx(doc, md, outPath) {
  const children = [
    new Paragraph({
      children: [
        new TextRun({ text: 'NATIONAL SOCIAL SECURITY FUND · UGANDA', bold: true, color: '0B5D3B', size: 20 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'NSSF SaveQuest', bold: true, size: 48, color: '1A2744' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: doc.title, size: 28, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '#WeBelieveInU · Save For Your Dream', italics: true, color: 'C9A227', size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    ...mdToDocxParagraphs(md),
    new Paragraph({
      children: [new TextRun({ text: 'CONFIDENTIAL — For NSSF Internal Review Only', bold: true, size: 18, color: 'C9A227' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
  ];

  const document = new Document({
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: `NSSF SaveQuest · ${doc.title}`, size: 16, color: '888888' })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Confidential · June 2026 · Page ', size: 16, color: '888888' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888' }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(document);
  fs.writeFileSync(outPath, buffer);
}

async function exportPdf(htmlPath, pdfPath) {
  // Try system Chrome/Chromium headless (macOS/Linux) — no puppeteer download needed
  const chromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const chrome of chromePaths) {
    if (!fs.existsSync(chrome)) continue;
    try {
      const { execFileSync } = await import('child_process');
      execFileSync(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        `--print-to-pdf=${pdfPath}`,
        `file://${htmlPath}`,
      ], { stdio: 'pipe', timeout: 60000 });
      if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 1000) return true;
    } catch {
      // try next
    }
  }

  // Fallback: puppeteer if installed
  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const html = fs.readFileSync(htmlPath, 'utf8');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
    await browser.close();
    return fs.existsSync(pdfPath);
  } catch {
    return false;
  }
}

async function main() {
  ensureDirs();
  console.log('NSSF SaveQuest — Exporting proposal documents...\n');

  const manifest = [];

  for (const doc of DOCS) {
    const md = readMarkdown(doc.file);
    const isExco = doc.file.includes('EXCO');
    const bodyHtml = mdToHtml(md);
    const html = buildHtml(doc.title, bodyHtml, isExco);

    const baseName = `NSSF-SaveQuest-${doc.short}`;
    const htmlPath = path.join(HTML_DIR, `${baseName}.html`);
    const docxPath = path.join(DOCX_DIR, `${baseName}.docx`);
    const pdfPath = path.join(PDF_DIR, `${baseName}.pdf`);

    fs.writeFileSync(htmlPath, html);
    console.log(`  ✓ HTML  → ${path.relative(ROOT, htmlPath)}`);

    await exportDocx(doc, md, docxPath);
    console.log(`  ✓ DOCX  → ${path.relative(ROOT, docxPath)}`);

    const pdfOk = await exportPdf(htmlPath, pdfPath);
    if (pdfOk) {
      console.log(`  ✓ PDF   → ${path.relative(ROOT, pdfPath)}`);
    } else {
      console.log(`  ○ PDF   → skipped (install puppeteer: npm i -D puppeteer)`);
      console.log(`           Use HTML → Print → Save as PDF instead`);
    }

    manifest.push({ name: doc.title, html: htmlPath, docx: docxPath, pdf: pdfOk ? pdfPath : null });
  }

  // Copy CSV manifest
  const csvFiles = fs.readdirSync(path.join(EXPORT_DIR, 'csv')).filter((f) => f.endsWith('.csv'));

  const manifestMd = `# NSSF SaveQuest — Export Manifest

Generated: ${new Date().toISOString()}

**HTML download hub:** [../index.html](../index.html)

## Documents

| Document | HTML | Word | PDF |
|----------|------|------|-----|
${manifest.map((m) => {
  const base = path.basename(m.html, '.html');
  return `| ${m.name} | [Open HTML](html/${base}.html) | [docx](docx/${base}.docx) | ${m.pdf ? `[pdf](pdf/${base}.pdf)` : '—'} |`;
}).join('\n')}

## Spreadsheets (CSV — open in Excel)

${csvFiles.map((f) => `- [${f}](csv/${f})`).join('\n')}

## Quick export to PDF (no puppeteer)

1. Open any \`.html\` file in Chrome or Edge
2. Press Ctrl+P / Cmd+P
3. Destination: **Save as PDF**
4. Enable **Background graphics**
`;

  fs.writeFileSync(path.join(EXPORT_DIR, 'MANIFEST.md'), manifestMd);
  console.log(`\n  ✓ Manifest → docs/nssf-proposal/export/MANIFEST.md`);

  const zipPath = path.join(EXPORT_DIR, 'NSSF-SaveQuest-Proposal-Package.zip');
  try {
    const { execFileSync } = await import('child_process');
    execFileSync('zip', ['-r', zipPath, 'html', 'docx', 'pdf', 'csv', 'MANIFEST.md'], {
      cwd: EXPORT_DIR,
      stdio: 'pipe',
    });
    console.log(`  ✓ ZIP   → docs/nssf-proposal/export/NSSF-SaveQuest-Proposal-Package.zip`);
  } catch {
    console.log(`  ○ ZIP   → skipped (zip command not available)`);
  }

  console.log('\nDone. All files in docs/nssf-proposal/export/');
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
