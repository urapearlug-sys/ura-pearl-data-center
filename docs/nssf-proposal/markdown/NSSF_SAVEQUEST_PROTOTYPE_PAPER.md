# NSSF SaveQuest — Part B: Prototype Paper

**Prepared for:** National Social Security Fund (NSSF) Uganda  
**Date:** June 2026 | **Classification:** Confidential

---

## B.1 Document Purpose

This prototype paper presents **NSSF SaveQuest** for EXCO and Board review — concept, user experience, technical approach, and pilot plan without requiring production deployment.

---

## B.2 Problem Statement

| Challenge | Current State | 2035 Target |
|-----------|---------------|-------------|
| Coverage | ~11% (~3.35M registered) | 50% (~15M members) |
| AUM | UGX 23.5T+ | UGX 50T |
| Satisfaction | Rising, staff 91% | 95% stakeholder satisfaction |

**Specific gaps:**

1. **Benefit dissipation** — 98% spend benefits within 2 years; ~5% retirees achieve financial independence
2. **Informal sector exclusion** — 85% of gig workers have no retirement savings
3. **Digital fatigue vs. engagement** — NSSF Go handles transactions, not daily saving behaviour
4. **Youth channel** — 50% under 18; Telegram has 2M+ Ugandan users, no app-store install

---

## B.3 Proposed Solution: NSSF SaveQuest

**Tagline:** *Save For Your Dream — One Shield Point at a Time*

Telegram Mini App (with NSSF Go deep-link integration) gamifying financial literacy, Smartlife Flexi activation, referrals, and benefit education.

### Shield Points Economy

| Tier | Name | Meaning | Example Activities |
|------|------|---------|-------------------|
| White Shield | Instant | Learning & engagement | Daily login, quizzes, tap arena |
| Blue Shield | Verified | Admin-verified | Contribution proof, employer registration |
| Gold Shield | Mature | Long-term saver | 12-month Smartlife streak, FL certificate |

*Non-monetary — badges, certificates, leaderboard status only. Not a substitute for NSSF savings balances.*

---

## B.4 Platform Architecture

```
MEMBER TOUCHPOINTS
  Telegram Mini App | NSSF Go (deep links) | WhatsApp/Sanyu
         ↓
NSSF SAVEQUEST ENGAGEMENT LAYER
  Home | Learn | Services | Earn | Guild | Settings
  Gamification Engine | Shield Points | Notifications
         ↓
ADMIN & OPERATIONS
  Content CMS | Quiz Manager | Approval Queue | Analytics
         ↓
NSSF CORE SYSTEMS
  NSSF Go API | Member Registry | Smartlife Flexi | Sanyu
```

**Design principles:** Complement NSSF Go; no direct fund movement without NSSF Go handoff; Sanyu first for account queries; data minimisation.

---

## B.5 Feature Mapping: URA → NSSF

| URA Feature | NSSF Adaptation | Priority |
|-------------|-----------------|----------|
| Home / Action Center | Savings shortcuts, Smartlife CTA, benefit tracker | P0 |
| Karibu Daily | **Save Daily** — 10-day savings habit | P0 |
| URA Quiz | **NSSF Knowledge Quiz** | P0 |
| Learn | **Financial Literacy Hub** | P0 |
| Services | **NSSF Services Directory** | P0 |
| Receipt Rush | **Contribution Verify** | P1 |
| Guild | **Saver Network** | P0 |
| Tap Arena | **Shield Tap** engagement game | P2 |
| Teams / Leagues | **Employer Leagues** | P2 |
| Support Chat | **Help** — AI + Sanyu handoff | P0 |
| Wallet / TON / NFT | **Removed** | — |
| Tax Calculator | **Retirement Projection Calculator** | P1 |
| Admin console | Full NSSF operations toolkit | P0 |

---

## B.6 User Journeys

### Journey 1 — Informal worker (boda-boda)

1. QR at boda stage → Telegram bot
2. Onboarding quiz → 100 White Shields
3. Prompt: Smartlife Flexi UGX 5,000/week
4. Deep-link NSSF Go → enroll
5. Save Daily streak → Day 7 Blue Shield
6. Refer colleagues → district leaderboard

### Journey 2 — Formal employee

1. HR sends link in payslip
2. Services → e-statement via NSSF Go
3. Financial Literacy module → certificate
4. Upload payslip → Blue Shield (admin approval)
5. Employer League quiz competition

### Journey 3 — NSSF admin

1. Review Contribution Verify queue
2. Approve → Blue Shield + notification
3. Publish weekly Save Challenge
4. Analytics: Smartlife enrollments, quiz rates

---

## B.7 Prototype Screens

**Home:** Profile, banner, Shield Points, rank, Action Center (Save Daily, Quiz, Smartlife, Contribution Verify), Help FAB

**Learn:** General | Retirement Journey | Smartlife Flexi tabs; sector cards with lessons

**Services:** Search; categories Register, Pay, Claims, Employer, Branches, Smartlife

**Earn:** Quiz, Save Daily, Decode, Weekly Challenge; Wallet tab for Shield breakdown

**Saver Network:** National/district leaderboards, referral link, champions

---

## B.8 Integration with NSSF Digital Ecosystem

| System | Relationship |
|--------|--------------|
| NSSF Go | Deep links for enrollment, payments, claims |
| Sanyu | Account service escalation from Help |
| USSD *254# | Cross-promotion for low-connectivity |
| Smartlife Flexi | Enrollment & habit formation |
| Financial Literacy Programme | Certificate sync |
| Employer Portal | Employer leagues & compliance |

---

## B.9 Pilot Success Metrics (90 Days)

| KPI | Target |
|-----|--------|
| Registered users | 50,000 |
| DAU | 5,000 (10% DAU/MAU) |
| Smartlife enrollments via SaveQuest | 5,000 |
| FL modules completed | 15,000 |
| Quiz completion rate | >60% |
| Referral conversions | 2,000 |
| Cost per engaged member | < UGX 3,000 |

---

## B.10 Prototype Timeline

| Week | Activity |
|------|----------|
| 1–2 | Discovery, brand approval |
| 3–5 | UI rebrand, core shell |
| 6–8 | Demo content, 5 modules, quiz, Save Daily |
| 9 | EXCO demo |
| 10 | Refinement, go/no-go for Phase 2 |

---

## B.11 Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API access delayed | Mock data in prototype |
| Regulatory (gamification) | Non-monetary points; legal Phase 0 |
| Low Telegram among 45+ | NSSF Go notifications & branch QR |
| Confusion with NSSF Go | Clear channel messaging |

---

*Full deck outline: `NSSF_SAVEQUEST_PROTOTYPE_DECK_OUTLINE.md`*
