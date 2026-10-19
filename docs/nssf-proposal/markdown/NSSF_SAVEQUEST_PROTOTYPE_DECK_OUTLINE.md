# NSSF SaveQuest — Prototype Deck Outline

**Presentation for:** NSSF EXCO / Board  
**Duration:** 45–60 minutes (incl. Q&A)  
**Format:** 24 slides + appendix backup  
**Brand:** NSSF — #WeBelieveInU | Save For Your Dream

---

## Slide 1 — Title

- **Title:** NSSF SaveQuest — Gamified Member Engagement for Vision 2035
- **Subtitle:** Prototype Proposal & Pilot Programme
- **Presented by:** [Organisation Name]
- **Date:** June 2026
- **Visual:** NSSF logo + SaveQuest shield icon mockup

---

## Slide 2 — Agenda

1. Strategic context & Vision 2035 alignment
2. The problem we are solving
3. Introducing NSSF SaveQuest
4. Live prototype demo (10 min)
5. Platform architecture & integrations
6. User journeys (3 personas)
7. Pilot programme & budget
8. ROI & business case
9. Timeline & recommendation
10. Q&A

---

## Slide 3 — Strategic Context

- **Vision 2035:** 50% coverage | UGX 50T AUM | 95% satisfaction
- **Current state:** 3.35M members (11% of workforce), UGX 23.5T+ AUM
- **Gap:** 12M+ informal workers underserved; Smartlife Flexi needs engagement layer
- **MD quote:** *"Creating a willingness to save and building the capacity of Ugandans to save"* — Patrick Ayota
- **Visual:** 50:50:95 infographic

---

## Slide 4 — The Problem

| Challenge | Data Point |
|-----------|------------|
| Benefit dissipation | 98% spend benefits within 2 years |
| Informal sector | 85% of gig workers have no retirement savings |
| Financial literacy | Only ~5% of retirees achieve financial independence |
| Digital gap | NSSF Go = transactions; no daily engagement loop |
| Youth | 50% of population under 18 — need early saving culture |

- **Visual:** Problem statement icons (4 quadrants)

---

## Slide 5 — Why Telegram?

- **2M+ Ugandan Telegram users** — no app-store install
- **Informal sector access** — boda stages, markets, gig workers already on Telegram
- **Low data cost** — lightweight Mini App vs. full native app
- **Proven model** — URAPearls platform live for URA (adaptation, not greenfield)
- **Complements NSSF Go** — engagement layer, not replacement

---

## Slide 6 — Introducing NSSF SaveQuest

- **Tagline:** *Save For Your Dream — One Shield Point at a Time*
- **What it is:** Gamified Telegram Mini App for learning, saving habits, referrals
- **What it is NOT:** Payment processor, benefit adjudicator, or balance manager (those stay in NSSF Go)
- **Core modules:** Home | Learn | Services | Earn | Saver Network
- **Visual:** App shell mockup (5-tab navigation)

---

## Slide 7 — Shield Points Economy

| Tier | Name | Meaning | Example |
|------|------|---------|---------|
| White Shield | Instant | Learning & engagement | Daily login, quizzes |
| Blue Shield | Verified | Admin-approved actions | Contribution proof upload |
| Gold Shield | Mature | Long-term saver status | 12-month Smartlife streak |

- **Important:** Non-monetary — badges, certificates, leaderboard status only
- **Visual:** Three-tier shield graphic

---

## Slide 8 — Feature Overview

| Module | Key Features |
|--------|--------------|
| **Home** | Shield balance, rank, Save Daily streak, action shortcuts |
| **Learn** | Financial Literacy modules, retirement journey, Smartlife Flexi education |
| **Services** | NSSF portal directory, deep links to NSSF Go, branch locator |
| **Earn** | Quizzes, weekly challenges, contribution verify, referrals |
| **Saver Network** | District leaderboards, referral champions, invite links |

---

## Slide 9 — LIVE DEMO

- **Duration:** 10 minutes
- **Flow:**
  1. Open Telegram → NSSF SaveQuest Bot
  2. Onboarding quiz → earn White Shields
  3. Save Daily streak
  4. Financial Literacy module sample
  5. Services → Smartlife Flexi deep link
  6. Help widget → Sanyu handoff
- **Note:** Interactive prototype on staging environment

---

## Slide 10 — Architecture (Conceptual)

```
Members → Telegram / NSSF Go deep links
         ↓
    SaveQuest Engagement Layer
         ↓
    Admin Console (NSSF staff)
         ↓
    NSSF Core Systems (NSSF Go API, Sanyu, Smartlife)
```

- **Principles:** Complement not replace | Data minimisation | Sanyu first for account queries
- **Visual:** Architecture diagram (from Prototype Paper)

---

## Slide 11 — Integration with NSSF Ecosystem

| System | Relationship |
|--------|--------------|
| NSSF Go | Deep links for enrollment, payments, claims |
| Sanyu | Help widget escalates account queries |
| Smartlife Flexi | Enrollment & habit activation |
| Financial Literacy Programme | Certificate sync |
| USSD *254# | Cross-promotion for low-connectivity users |

---

## Slide 12 — User Journey: Boda-Boda Rider

1. QR at boda stage → Telegram bot
2. 3-min onboarding quiz → 100 White Shields
3. Prompt: *"Start UGX 5,000/week with Smartlife Flexi"*
4. Deep-link to NSSF Go → enroll
5. Daily Save Daily streak → Day 7 Blue Shield badge
6. Refer 2 colleagues → district leaderboard

- **Visual:** Journey map (6 steps)

---

## Slide 13 — User Journey: Formal Employee

1. HR sends SaveQuest link in payslip
2. Services → e-statement via NSSF Go
3. Financial Literacy module → certificate
4. Upload payslip → Blue Shield (admin approval)
5. Join Employer League → team quiz competition

---

## Slide 14 — User Journey: NSSF Admin

1. Admin console → review Contribution Verify queue
2. Approve → member gets Blue Shield + notification
3. Publish weekly Save Challenge
4. Analytics: Smartlife enrollments, quiz completion rates

---

## Slide 15 — URA → NSSF Feature Mapping

| URA (Source) | NSSF (Adapted) |
|--------------|----------------|
| Pearls | Shield Points |
| Karibu Daily | Save Daily streak |
| URA Quiz | NSSF Knowledge Quiz |
| Tax education | Financial Literacy Hub |
| URA Services | NSSF Services Directory |
| Receipt Rush | Contribution Verify |
| Guild | Saver Network |
| TON/Blockchain | **Removed** |

---

## Slide 16 — Pilot Programme

| Region | Focus | Target Users |
|--------|-------|--------------|
| Central (Kampala) | Formal sector, employers | 20,000 |
| Western (Mbarara) | Agriculture, SMEs | 15,000 |
| Northern/Eastern | Informal sector, Smartlife | 15,000 |
| **Total** | | **50,000** |

- **Duration:** 12 weeks post-build
- **Deliverable:** Pilot evaluation report with go/no-go recommendation

---

## Slide 17 — Pilot Success Metrics

| KPI | 90-Day Target |
|-----|---------------|
| Registered users | 50,000 |
| Daily active users | 5,000 |
| Smartlife enrollments | 5,000 |
| Literacy modules completed | 15,000 |
| Referral conversions | 2,000 |
| Cost per engaged member | < UGX 3,000 |

---

## Slide 18 — Budget Options

| Option | Scope | Year 1 (UGX) |
|--------|-------|--------------|
| A — Prototype | POC only | 280M |
| **B — Pilot ★** | **3-region pilot** | **1.41B** |
| C — Full Year 1 | National launch | 2.02B |
| D — 3-Year | Build + 3 yrs support | 2.66B |

- **Saving vs greenfield:** 43–60% (UGX 1.5–3.0B)

---

## Slide 19 — ROI Hypothesis (Conservative)

| Value Driver | Annual Impact |
|--------------|---------------|
| Smartlife enrollments (20K/yr) | UGX 1B+ new AUM |
| Contact centre deflection | UGX 250M saved |
| Referral-based enrollment | UGX 3B+ new AUM |
| Benefit retention improvement | UGX 5B+ societal value |

- **3-year ROI:** Platform cost ~UGX 2.7B vs. UGX 10B+ AUM mobilised → **>3.7× return**

---

## Slide 20 — Implementation Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Discovery | 6 weeks | Requirements sign-off |
| Prototype | 10 weeks | EXCO demo |
| Full build | 20 weeks | Feature complete |
| Integration | 12 weeks | NSSF ICT sign-off |
| Content | 16 weeks | Curriculum ready |
| Pilot | 12 weeks | Evaluation report |
| Launch | 8 weeks | National go-live |

- **Total:** ~18 months to national launch

---

## Slide 21 — Risk Summary

| Risk | Mitigation |
|------|------------|
| Low adoption | Pilot-first; branch QR; employer mandates |
| Regulatory (gamification) | Non-monetary points; legal review |
| Integration delays | Mock data in prototype; phased launch |
| Confusion with NSSF Go | Clear messaging: SaveQuest = learn; NSSF Go = manage |

---

## Slide 22 — Governance & Operations

| Role | Owner |
|------|-------|
| Executive Sponsor | DMD Marketing & Communications |
| Product Owner | Head of Member Experience |
| Technical Owner | CTO (Benoni Katende) |
| Content Owner | Financial Literacy Programme Lead |
| Support | SaveQuest AI → Sanyu → Contact Centre → Branch |

---

## Slide 23 — Recommendation

1. **Approve Option B** — Pilot Programme (UGX 1.41B)
2. **Appoint executive sponsor** and ICT liaison
3. **Proceed to Phase 0** — Discovery workshops (6 weeks)
4. **Schedule EXCO prototype demo** — Week 9

**Immediate next step:** Sign Phase 0 + Phase 1 contract (UGX 280M for prototype)

---

## Slide 24 — Thank You / Q&A

- **NSSF SaveQuest** — Save For Your Dream
- **#WeBelieveInU**
- Contact: [Name] | [Email] | [Phone]
- **Appendix available:** Full budget, business plan, prototype paper

---

## Appendix Slides (Backup)

### A1 — Detailed Phase Budget Breakdown
### A2 — Payment Schedule & Milestones
### A3 — Technology Stack & Security
### A4 — Admin Console Capabilities (26 modules)
### A5 — Content Curriculum Outline (40+ modules)
### A6 — Competitive Landscape (NSSF Go vs Sanyu vs SaveQuest)
### A7 — Boda-Boda Sector Opportunity (1.2M riders, UGX 550B potential)
### A8 — Source Platform Inventory (433 files, 139 APIs)
### A9 — Team & Resource Plan
### A10 — IP & Ownership Terms

---

## Presenter Notes

- **Slide 9 (Demo):** Have backup screen recording if live demo fails
- **Slide 18 (Budget):** Lead with Option B; mention Option A as lower-risk entry if EXCO hesitant
- **Slide 19 (ROI):** Emphasise these are conservative; actual impact likely higher with informal sector scale
- **Timing:** Keep demo to 10 min max; leave 15 min for Q&A

## Design Guidelines for Deck Production

- **Primary colour:** NSSF Navy (#0B3D2E or brand green from nssfug.org)
- **Accent:** Gold (#C9A227) for highlights and CTAs
- **Typography:** Clean sans-serif (Arial, Calibri, or NSSF brand font if available)
- **Imagery:** Uganda workforce diversity, mobile phones, savings metaphors (shield, nest egg)
- **Logo placement:** Top-right on all slides except title (centred)
