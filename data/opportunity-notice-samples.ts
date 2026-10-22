/** Sample Opportunities hub content (seed when DB is empty). */

export type OpportunitySample = {
  category: 'auction' | 'career' | 'tender';
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
  sortOrder: number;
};

export const OPPORTUNITY_NOTICE_SAMPLES: OpportunitySample[] = [
  // —— Auctions (5) ——
  {
    category: 'auction',
    sortOrder: 0,
    title: 'Public auction — seized motor vehicles (Lot A–F)',
    body: `URA Customs will conduct a public auction of motor vehicles forfeited under the Customs Management Act.

Date & time: Thursday, 15 May 2026 · 10:00 AM EAT
Venue: URA Nakawa warehouse yard, Kampala
Lots: 18 vehicles (saloon, SUV, light trucks) — inspection 13–14 May 2026, 9:00 AM–4:00 PM

Requirements:
• Valid TIN and national ID
• Bid deposit: 10% of reserve price (bank guarantee or mobile money to URA)
• Successful bidders pay balance within 5 working days

Reserve prices and lot photos are published on ura.go.ug under Auctions. All sales are as-is; URA does not warrant roadworthiness.`,
    link: 'https://ura.go.ug/en/opportunities/auctions/',
    linkLabel: 'View auction notice on URA',
  },
  {
    category: 'auction',
    sortOrder: 1,
    title: 'Online auction — general goods (warehouse clearance)',
    body: `Non-tax revenue auction of assorted general goods held in URA bonded warehouses.

Bidding window: 22 April – 6 May 2026 (via URA e-auction portal)
Pickup: Entebbe and Malaba warehouses by appointment only
Categories: electronics, textiles, spare parts, mixed consumer goods

How to participate:
1. Register on the URA e-auction platform with your TIN
2. Pay participation fee UGX 200,000 (refundable to non-winners within 14 days)
3. Submit bids per lot; anti-sniping rules apply in final 10 minutes

Contact: auctions@ura.go.ug · Toll-free 0800 117 000`,
    link: 'https://ura.go.ug/en/opportunities/auctions/auctioning-application/',
    linkLabel: 'E-auction application',
  },
  {
    category: 'auction',
    sortOrder: 2,
    title: 'Private treaty — prime office equipment',
    body: `URA invites sealed offers for surplus office equipment under private treaty (direct sale).

Items: desks, chairs, servers, printers, conference AV — full inventory list attached to notice REF/AUC/2026/041
Minimum offer: 70% of independent valuation report (available on request)
Closing: 30 April 2026, 4:00 PM at URA Headquarters, Nakawa

Submission:
• Cover letter with TIN and contact
• Itemised offer in UGX (no decimals)
• Proof of ability to collect within 7 days of acceptance

Evaluation is on price and collection plan. URA may reject any offer without giving reasons.`,
  },
  {
    category: 'auction',
    sortOrder: 3,
    title: 'Customs auction — mixed container cargo (1×40ft)',
    body: `One 40-foot container of mixed imported goods — unclaimed after statutory notice period.

Container mark: URA/MBA/2025/8841
Location: Mbarara inland container depot
Viewing: 8–10 May 2026 (business hours, PPE required)

Sale method: Single-lot ascending auction on 12 May 2026 at 11:00 AM
Deposit: UGX 5,000,000 prior to bidding
Duties & taxes: Buyer clears any outstanding customs charges before release

Importers with valid claim documents may contact the depot manager before the auction date.`,
    link: 'https://ura.go.ug/en/import-export/warehousing/public-online-auction/',
    linkLabel: 'Warehousing auctions info',
  },
  {
    category: 'auction',
    sortOrder: 4,
    title: 'Auction — abandoned perishable goods (cold store)',
    body: `Perishable goods in cold storage exceeding allowed retention — disposal by public auction.

Commodity: frozen poultry products (approx. 12 tonnes)
Cold store: Entebbe logistics park
Auction date: 28 April 2026 · 8:00 AM

Health & safety: Bidders must comply with UNBS and Ministry of Health handling rules. Export-only buyers must show valid permits.

Registration closes 48 hours before the auction. No onsite consumption; transfer of title at gate pass issuance only.`,
  },

  // —— Careers (5) ——
  {
    category: 'career',
    sortOrder: 0,
    title: 'Commissioner Domestic Taxes — internal vacancy',
    body: `Uganda Revenue Authority invites applications from serving URA staff for the position of Commissioner Domestic Taxes (structured leadership band).

Key accountabilities:
• Lead domestic tax policy implementation and revenue performance
• Oversee taxpayer service transformation and compliance strategy
• Chair domestic tax management committee and represent URA at MOFPED forums

Minimum: Master’s in economics, finance, or law; 15+ years public-sector tax experience; proven leadership at director level.

Application: Internal HR portal · Reference INT/DT/2026/03
Closing: 12 May 2026

Only shortlisted candidates will be contacted. URA is an equal opportunity employer.`,
    link: 'https://ura.go.ug/en/opportunities/careers/',
    linkLabel: 'URA Careers portal',
  },
  {
    category: 'career',
    sortOrder: 1,
    title: 'Experiential hiring — Data & analytics graduates',
    body: `URA Experiential Hiring Programme (6-month paid placement) for recent graduates in data science, statistics, or computer science.

Placements:
• Business intelligence — revenue reporting dashboards
• Risk analytics — compliance scoring models
• EFRIS data quality monitoring

Eligibility: Bachelor’s completed within last 24 months; proficiency in SQL/Python; Ugandan citizen.

Stipend: UGX 1,200,000 per month · Possible conversion to permanent role based on performance.

Apply with CV, academic transcripts, and 500-word motivation to careers@ura.go.ug (subject: EXP/DATA/2026).`,
    link: 'https://ura.go.ug/en/opportunities/careers/experiential-hiring/',
    linkLabel: 'Experiential hiring details',
  },
  {
    category: 'career',
    sortOrder: 2,
    title: 'Customs officer — border post (Arua)',
    body: `Permanent position: Customs Officer II based at Arua One Stop Border Post.

Duties:
• Process import/export declarations and physical verification
• Support risk-based targeting and trader education
• Work in rotating shifts including weekends

Requirements: Bachelor’s in any field; Diploma in Customs/Logistics is an advantage; clean conduct certificate; medical fitness.

Benefits: URA staff medical scheme, pension, professional training (WCO programmes).

Applications via URA recruitment portal · Vacancy REF/CUS/ARU/2026/07 · Closes 20 May 2026.`,
  },
  {
    category: 'career',
    sortOrder: 3,
    title: 'Internship — Tax education & outreach (10 slots)',
    body: `Three-month internship for university students in communications, education, or social sciences.

Activities:
• Support community tax literacy campaigns
• Assist at URA E-Learning content updates
• Help coordinate Ask the Kamisona outreach events

Location: Kampala HQ with upcountry travel (20%)

Allowance: UGX 450,000/month · Certificate of completion · Priority reference for future URA graduate intake.

Send application letter, CV, and recommendation letter from your institution by 5 May 2026.`,
    link: 'https://ura.go.ug/en/opportunities/careers/internships/',
    linkLabel: 'Internship programme',
  },
  {
    category: 'career',
    sortOrder: 4,
    title: 'CCFL programme — future leaders intake 2026',
    body: `Corporate Compliance & Future Leaders (CCFL) — 12-month rotational programme for early-career professionals.

Rotations: Domestic tax operations, customs, legal, taxpayer services, ICT

Criteria: Age 24–32; Bachelor’s with Second Class Upper or better; leadership track record in university or community projects; commitment to public service values.

Selection: Aptitude test · Panel interview · Background verification

Intake: July 2026 · 15 places nationally

Detailed TOR and online application form published on the URA Careers page when the window opens.`,
    link: 'https://ura.go.ug/en/opportunities/careers/ccfl-program/',
    linkLabel: 'CCFL programme',
  },

  // —— Tenders (5) ——
  {
    category: 'tender',
    sortOrder: 0,
    title: 'Supply & install EFRIS integration kits (Framework)',
    body: `Request for Bids: Framework agreement for supply, installation, and maintenance of EFRIS integration hardware for designated taxpayers.

Scope: Fiscal routing devices, onboarding support, 24-month warranty
Duration: 2 years framework · Call-offs per region
Estimated value: UGX 4.2 billion (inclusive of VAT where applicable)

Mandatory documents:
• Valid URA TIN and tax clearance certificate
• Proof of manufacturer authorization
• Audited accounts for last 2 years
• ISO 9001 or equivalent quality certification

Submission: URA Procurement Management System (PMS) · Tender No. URA/PROC/EFRIS/2026/011
Deadline: 18 May 2026, 11:00 AM EAT
Pre-bid meeting: 28 April 2026 (virtual — link on PMS)`,
    link: 'https://ura.go.ug/en/opportunities/tenders/procurement-management-system/',
    linkLabel: 'Open URA PMS',
  },
  {
    category: 'tender',
    sortOrder: 1,
    title: 'Cleaning & landscaping services — regional offices',
    body: `Open domestic tender for cleaning, gardening, and pest control at URA regional offices (Eastern, Northern, Western clusters).

Contract period: 12 months renewable once
Service levels: Daily office cleaning, weekly grounds maintenance, quarterly fumigation

Eligibility: Registered company · NSSF clearance · Minimum 3 similar contracts in last 5 years

Bid security: UGX 15,000,000
Envelope opening: 8 May 2026, URA HQ boardroom (public)

All bids must be uploaded to PMS and physical originals delivered before deadline. Late submissions rejected.`,
  },
  {
    category: 'tender',
    sortOrder: 2,
    title: 'Enterprise network refresh — core data centre',
    body: `Restricted tender (pre-qualified vendors list) for core switch replacement and SD-WAN rollout at URA primary data centre and DR site.

Technical minimums:
• 100G core switching · redundant power
• SD-WAN with encryption FIPS 140-2 validated
• 36-month OEM support

Evaluation: 70% technical · 30% financial
Validity of bid: 120 days

Tender document fee: UGX 500,000 (non-refundable) via PRN
Clarifications: procurement@ura.go.ug · Reference URA/ICT/NET/2026/004`,
    link: 'https://ura.go.ug/en/opportunities/tenders/tender-user-manuals/',
    linkLabel: 'Tender user manuals',
  },
  {
    category: 'tender',
    sortOrder: 3,
    title: 'Consultancy — taxpayer segmentation study',
    body: `Short-term consultancy to design a risk-based taxpayer segmentation model for domestic taxes.

Deliverables:
• Data analysis plan using anonymised ledger samples
• Segmentation methodology aligned to URA compliance strategy
• Training for 40 staff · Final report and executive presentation

Duration: 90 days from contract signing
Budget ceiling: UGX 180,000,000 (inclusive of withholding tax)

Qualifications: Firm with 5+ years tax/revenue administration consulting in East Africa · Key expert: PhD or Master’s in econometrics.

EOI closing: 25 April 2026 · Full RFP issued to shortlisted firms only.`,
  },
  {
    category: 'tender',
    sortOrder: 4,
    title: 'Procurement of armoured cash-in-transit vehicles',
    body: `Supply of three (3) armoured vehicles for secure movement of revenue collections.

Specifications: B6 ballistic protection · GPS tracking · SLA with local service centre
Delivery: Within 120 days of LC opening
Warranty: Minimum 24 months / 100,000 km

Local content: Preference for assembly or significant value addition in Uganda per PPDA guidelines.

Bid opening: 22 May 2026
Tender No. URA/PROC/FLEET/2026/002

Interested bidders must register on PMS and download the full technical specification pack.`,
    link: 'https://ura.go.ug/en/opportunities/tenders/',
    linkLabel: 'URA Tenders',
  },
];
