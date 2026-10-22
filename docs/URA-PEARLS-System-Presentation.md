# URA PEARLS — System Presentation

**Uganda Revenue Authority · Citizen engagement on Telegram**

| | |
|---|---|
| **Product** | URA PEARLS Telegram Mini App |
| **Repository** | ura-pearl-data-center |
| **Audience** | URA leadership, product, and technical stakeholders |
| **Version** | 0.2.3 · October 2026 |

---

## 1. Executive summary

URA PEARLS is a **Telegram Mini App** that brings tax education, simulated payment flows, and reward-based engagement into one **mobile-first** experience. Citizens learn how URA works, practice **PRN registration and payment** in a safe simulator, ask questions via **Ask the Kamisona**, and earn **PEARLS** (white, blue, and golden) for positive participation.

The system is designed to feel **official** (URA navy and gold), remain **simple** for first-time users, and give administrators **control** over content such as URA TV programmes, opportunities notices, and driver-licence applications.

---

## 2. Why this system exists

| Challenge | How URA PEARLS responds |
|-----------|-------------------------|
| Low awareness of tax processes | Learn hub, URA TV, quizzes, and Kamisona FAQ links |
| Complexity of PRN and payments | Step-by-step **Register new payment** and **Pay against PRN** simulators |
| Trust and accessibility | Runs inside Telegram; no separate app store install |
| Sustained engagement | PEARLS rewards, Karibu Daily, Earn activities, Guild |

---

## 3. Platform architecture (high level)

```
Telegram User
     │
     ▼
Telegram Mini App (Next.js 14 · React)
     │
     ├── Client state (game store, local caches for PRN demo)
     │
     └── HTTPS APIs
              ├── MongoDB (Prisma) — users, notices, TV, admin data
              ├── Pearl activity & balances
              └── Support chat (Kamisona mode)
```

**Hosting:** Vercel-style deployment with `prisma generate` + `next build`.  
**Identity:** Telegram WebApp `initData` validation on sensitive actions (comments, pearl awards, payments simulation persistence).

---

## 4. Navigation model

| Tab | Purpose |
|-----|---------|
| **Home** | Action Center, Total PEARLS, Quick Access, ecosystem shortcuts |
| **Learn** | URA TV, Opportunities (Auctions · Careers · Tenders), URA FC, tax calculators |
| **Services** | Links to official URA digital services |
| **Earn** | Quizzes, True/False, voice reports, tenure pledge, ratings, events |
| **Guild** | Community, referrals, teams |

Sub-pages (URA TV, Opportunities) return to **Learn** when the user taps Back.

---

## 5. Quick Access — core tax journeys

### 5.1 Register new payment (simulated)

1. Choose what you are registering (income tax, VAT, PAYE, withholding, customs, stamp duty, motor, Other NTR, penalties).
2. Complete a **simplified URA payment registration** form aligned with the official slip flow: Tax Head category, Tax Head, TIN, taxpayer name, district, period, basis of payment, amount.
3. **Accept and register** → PRN slip with PDF, share, QR, copy PRN, **Save slip**, or **Pay now**.

### 5.2 Pay against PRN (simulated)

1. Enter PRN (must exist from registration).
2. Review full registration details.
3. Choose **payment option** (mobile money, card, banks, URA cash office).
4. Receipt with download, print, share, and Profile → Downloads history.

### 5.3 Ask the Kamisona

- AI-assisted answers in-app.
- **FAQs** tab: **Luganda** → Buuza Kamisona (URA site); **English** → Ask URA Commissioner General.
- Handoff to Telegram or URA toll-free for unresolved questions.

---

## 6. Learn hub

| Module | Description |
|--------|-------------|
| **URA TV** | Upcoming and Library videos from @uratvofficial; in-app playback; **Comments & suggestions** per video |
| **Opportunities** | Tabs: Auctions, Careers, Tenders — title list with tap-through **detail modal** |
| **URA FC** | Club fixtures and highlights |
| **Tax calculators** | PAYE and related quick tools |

---

## 7. Earn & PEARLS economy

| Pearl type | Meaning |
|------------|---------|
| **White** | Instant or approved-in-app rewards (e.g. quiz, True/False win) |
| **Blue** | Pending admin approval (e.g. voice report, whistle blower) |
| **Golden** | Approved, withdraw-ready balance |

**Examples**

- **True or False — Uganda Tax Edition:** 3 questions; **all correct** to win white PEARLS; any wrong answer = no reward.
- **Voice reports, Whistle blower, Rate service:** Structured forms with pearl rules.
- **Profile → Downloads:** Payment slips and receipts (PDF, print, QR).

**Privacy:** Home **Total PEARLS** supports hide/show via eye icon (values masked locally).

---

## 8. Administration

| Area | Capability |
|------|------------|
| Opportunity notices | Publish auctions, careers, tenders |
| URA TV programmes | Schedule and YouTube embeds |
| Driver licence applications | Review Quick Access submissions |
| Pearl activities | Approve blue-pearl submissions |

---

## 9. Design principles

1. **URA brand first** — Navy `#123f78`, gold `#f3ba2f`, clear typography.
2. **Short flows** — Multi-step forms with Next/Back; scrollable receipts.
3. **Simulate before live** — PRN and payments are clearly labelled simulated until integrated with live URA APIs.
4. **Telegram-aware** — PDF share, print fallbacks, external links via `Telegram.WebApp.openLink`.

---

## 10. Current status & next steps

**Delivered:** Quick Access payment simulator, Kamisona + FAQ languages, URA TV comments, Opportunities samples, pearl privacy toggle, Learn-correct back navigation.

**Typical next integrations:** Live PRN validation, official payment gateway, deeper EFRIS/TIN lookup, expanded admin analytics.

---

## 11. Contact & references

- URA website: [ura.go.ug](https://ura.go.ug)
- Payment registration reference: [Generate a payment slip](https://ura.go.ug/en/domestic-taxes/make-a-payment/generate-a-payment-slip/)
- Buuza Kamisona: [Media Center](https://ura.go.ug/en/media-center/buuza-kamisona/)
- Commissioner General FAQs: [Ask URA CG](https://ura.go.ug/en/ask-ura-commissioner-general-4/)

---

*This document describes the URA PEARLS Telegram Mini App as implemented in the ura-pearl-data-center codebase. Simulated payment flows are for training and UX validation unless explicitly connected to production URA systems.*
