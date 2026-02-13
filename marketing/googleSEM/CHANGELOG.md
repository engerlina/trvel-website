# Marketing Decisions Changelog

This file tracks all marketing strategy decisions, changes, and rationale.

---

## 2026-02-14 - Landing Page: Reduce Plan Cards from 5 to 3 (Choice Overload Fix)

### Context

- Landing pages showed 5 plan cards by default + 4-5 hidden behind a toggle (9-10 total options)
- Classic "paradox of choice" problem — research shows 3 options converts best
- Two "1 Week" cards side-by-side (1GB $4.99 vs Unlimited $34.99) created confusion
- Grid layout was awkward: 5 cards in a 3-column grid = 3 top row + 2 bottom row

### Change Made

Replaced database-driven `default_durations` plan selection with a smart 3-plan algorithm:

| Position | Card Type | Example (Japan) | Psychology |
|----------|-----------|-----------------|------------|
| Left | Budget (cheapest fixed) | 1GB / 7 days - $4.99 | Low anchor, captures price-sensitive |
| **Center** | **Unlimited hero** | **Unlimited / 7 days - $34.99** | **"Most Popular" badge, the one we want them to buy** |
| Right | Value (best daily rate fixed) | 2GB / 15 days - $7.99 | Long-trip budget option |

All remaining plans moved behind the "more plans available" toggle.

### Algorithm (`selectHeroPlans`)

1. **Budget**: Cheapest fixed-data plan by retail price
2. **Hero**: 7-day unlimited (preferred), fallback to 5-day, then middle unlimited
3. **Value**: Best daily-rate fixed plan that's different from budget

Falls back gracefully if destination has only unlimited or only fixed plans.

### Files Modified

- `app/[locale]/[destination]/DestinationPlansSection.tsx` — Added `selectHeroPlans()`, replaced `defaultDurations` filtering

### Expected Impact

- Reduce decision fatigue → higher conversion rate
- Unlimited plan prominently in center with "Most Popular" → higher AOV
- Clean 3-column grid that displays correctly on all screen sizes
- All plans still accessible via toggle for users who want more options

---

## 2026-02-14 - Pause Non-Converting Ad Groups & Performance Review

### Context
- Review of Feb 7-13, 2026 performance (7-day window)
- CPA still well above A$30 target
- 4 of 8 ad groups producing zero conversions

### Performance Snapshot (Feb 7-13, 2026)

**Campaign Level:**

| Metric | Value | Change vs Jan 26 baseline |
|--------|-------|--------------------------|
| Cost | A$780.34 | — (7-day period) |
| Impressions | 1,174 | — |
| Clicks | 163 | — |
| CTR | 13.88% | Up from 6.33% |
| Avg. CPC | A$4.79 | — |
| Conversions | 5 | — |
| Conv. Rate | 3.07% | Up from 1.28% |
| Conv. Value | A$220.95 | — |
| CPA | A$156.07 | Down from A$405.86 |
| ROAS | 28.3% | Up from 11.8% |

**Ad Group Breakdown:**

| Ad Group | Clicks | Impr | CTR | Avg CPC | Cost | Conv | CPA | Conv Rate |
|----------|--------|------|-----|---------|------|------|-----|-----------|
| Indonesia eSIM | 27 | 212 | 12.74% | A$4.88 | A$131.69 | 1 | A$131.69 | 3.70% |
| Singapore eSIM | 26 | 181 | 14.36% | A$3.52 | A$91.39 | 1 | A$91.39 | 3.85% |
| Japan eSIM | 24 | 158 | 15.19% | A$8.17 | A$196.09 | 2 | A$98.05 | 8.33% |
| Malaysia eSIM | 23 | 181 | 12.71% | A$5.41 | A$124.43 | 0 | — | 0.00% |
| Vietnam eSIM | 21 | 99 | 21.21% | A$3.64 | A$76.47 | 0 | — | 0.00% |
| Thailand eSIM | 18 | 118 | 15.25% | A$4.04 | A$72.63 | 0 | — | 0.00% |
| South Korea eSIM | 14 | 131 | 10.69% | A$3.24 | A$45.37 | 1 | A$45.37 | 7.14% |
| Travel eSIM - General | 10 | 94 | 10.64% | A$4.23 | A$42.27 | 0 | — | 0.00% |

### Key Observations

1. **Trend is improving**: CPA dropped from A$405 → A$156, conv rate up from 1.28% → 3.07%, CTR up from 6.33% → 13.88%
2. **Still losing money on every sale**: Avg order value ~A$44 vs A$156 CPA
3. **40% of budget wasted**: A$315.80/week spent on 4 ad groups with zero conversions
4. **Best performers**: South Korea (A$45 CPA, 7.14% conv rate), Japan (8.33% conv rate but A$8.17 CPC)
5. **CTR is exceptional** — the ads work, the problem remains post-click (pricing/landing page)

### Actions Taken

- [x] **Paused Malaysia eSIM** — A$124.43 spent, 0 conversions
- [x] **Paused Vietnam eSIM** — A$76.47 spent, 0 conversions
- [x] **Paused Thailand eSIM** — A$72.63 spent, 0 conversions
- [x] **Paused Travel eSIM - General** — A$42.27 spent, 0 conversions

**Remaining active ad groups (4):**
- Japan eSIM (best conv rate: 8.33%)
- South Korea eSIM (best CPA: A$45.37)
- Singapore eSIM (converting, 3.85%)
- Indonesia eSIM (converting, 3.70%)

### Rationale

Concentrating the A$99/day budget across 4 converting ad groups instead of 8 should:
- Eliminate ~A$315/week in wasted spend
- Give more budget/impressions to ad groups that actually convert
- Improve overall CPA from A$156 toward target of A$30

### Outstanding Issues

- CPA still 5x above A$30 target — even best performer (South Korea A$45) is above target
- Need to investigate landing page conversion rate and checkout friction
- Tiered pricing (Decision 1 from Jan 26) implementation status needs review
- Budget may still be too high at A$99/day — consider reducing to A$50-60/day

---

## 2026-02-02 - Google Ads Campaign Restructure & Budget Increase

### Context
- Changes recommended by Google Ads platform suggestions
- Budget increased to accommodate expanded ad group structure
- Optimization score at 89.3% after applying changes

### Actions Taken

- [x] **Increased daily budget from ~A$66/day to A$75/day** (later raised to A$99/day)
- [x] **Re-enabled destination-specific ad groups** — Japan, Thailand, Indonesia, Malaysia, Vietnam, Singapore, South Korea all set to active
- [x] **Applied Google-recommended campaign changes** — accepted platform suggestions for ad group structure and targeting
- [x] **Travel eSIM - General** kept active alongside destination-specific groups

### Ad Group Structure (post-change)

| Ad Group | Status |
|----------|--------|
| Indonesia eSIM | Enabled |
| Singapore eSIM | Enabled |
| Japan eSIM | Enabled |
| Malaysia eSIM | Enabled |
| Vietnam eSIM | Enabled |
| Thailand eSIM | Enabled |
| South Korea eSIM | Enabled |
| Travel eSIM - General | Enabled |

### Notes

- This reversed Decision 2 from Jan 26 (which paused destination ad groups)
- Rationale: Test whether tiered pricing implementation + Google's suggestions improve destination-specific conversion rates

### Results (Feb 2-13, full 12-day period)

**Campaign Totals:**

| Metric | Value |
|--------|-------|
| Impressions | 2,126 (up 939) |
| Cost | A$1,245.09 (up A$663.97) |
| Conversions | 8.00 (up 6.00) |
| CPA | A$155.64 |

**Ad Group Performance:**

| Ad Group | Status | Clicks | Impr | CTR | Avg CPC | Cost | Conv | CPA | Conv Rate |
|----------|--------|--------|------|-----|---------|------|------|-----|-----------|
| Japan eSIM | Eligible | 49 | 364 | 13.46% | A$6.83 | A$334.64 | 3 | A$111.55 | 6.12% |
| Indonesia eSIM | Eligible | 48 | 344 | 13.95% | A$4.83 | A$231.60 | 2 | A$115.80 | 4.17% |
| Singapore eSIM | Eligible | 34 | 231 | 14.72% | A$3.73 | A$126.69 | 2 | A$63.35 | 5.88% |
| Vietnam eSIM | Paused | 34 | 249 | 13.65% | A$3.60 | A$122.27 | 0 | — | 0.00% |
| Thailand eSIM | Paused | 33 | 210 | 15.71% | A$4.29 | A$141.60 | 0 | — | 0.00% |
| Malaysia eSIM | Paused | 29 | 245 | 11.84% | A$4.96 | A$143.84 | 0 | — | 0.00% |

**Outcome:** 8 conversions total, but 3 of the visible ad groups produced zero conversions despite significant spend (A$407.71 combined, 33% of total budget). Led to Feb 14 re-pause of non-converters.

**Best performer by CPA:** Singapore eSIM (A$63.35)
**Best performer by conv rate:** Japan eSIM (6.12%)
**Most expensive CPC:** Japan eSIM (A$6.83)

---

## 2026-02-02 - Lighthouse Performance (en-au, Post-Optimization)

### Report summary (lighthousereview02_post.json)
- **Performance**: 91%
- **FCP**: 1.2s (0.99) | **LCP**: 2.6s (0.86) | **Speed Index**: 1.7s (1) | **TBT**: 272ms (0.82) | **CLS**: 0.007 (1)
- **Accessibility**: 92%

### Changes made (this session)
1. **Browserslist** (package.json): Target modern browsers only to reduce legacy polyfills (~11 KiB, LCP ~150ms). Chunk 117 had Array.at, flat, flatMap, Object.fromEntries, Object.hasOwn.
2. **optimizePackageImports**: Added `country-flag-icons` alongside `lucide-react` for better tree-shaking of flag imports.
3. **ElevenLabs widget**: Defer load using `requestIdleCallback` (timeout 5.5s) with 6s fallback and first interaction; reduces main-thread competition.

### Remaining opportunities (not implemented)
- **Render-blocking CSS**: Main app CSS (~23KB) blocks ~210ms (FCP/LCP). Next.js App Router does not support deferring/inlining primary CSS without custom setup; accept for now.
- **Bootup / main-thread**: Heaviest scripts: chunk 117 (~970ms), main doc (~1.3s), gtag (~259ms), ElevenLabs (~101ms). GA kept `afterInteractive` for conversion tracking; further deferral would need product trade-off.
- **Unused JS**: ~201 KiB estimated savings; dynamic imports and optimizePackageImports already applied; further gains need dependency-level tree-shake or route-level code-split.

---

## 2026-01-26 - Initial Marketing Strategy Review

### Context
- First comprehensive review of Google Ads performance
- Analysis period: Dec 27, 2025 - Jan 25, 2026
- Conducted by: Claude Code assisted analysis

### Performance Analysis

**Raw Numbers:**
| Metric | Value |
|--------|-------|
| Total Spend | A$1,217.58 |
| Total Conversions | 3 |
| CPA | A$405.86 |
| Conversion Value | ~A$143.46 |
| ROAS | 11.8% |
| Overall CTR | 6.33% |
| Conversion Rate | 1.28% |

**Ad Group Breakdown:**

| Ad Group | Clicks | Impr | CTR | Spend | Conv |
|----------|--------|------|-----|-------|------|
| Travel eSIM - General | 133 | 2,655 | 5.01% | A$601.06 | 3 |
| Thailand eSIM | 35 | 162 | 21.60% | A$219.58 | 0 |
| Japan eSIM | 20 | 209 | 9.57% | A$123.96 | 0 |
| Asia eSIM (paused) | 44 | 552 | 7.97% | A$251.56 | 0 |
| Europe eSIM (paused) | 3 | 97 | 3.09% | A$21.42 | 0 |

### Key Finding

**High CTR + Zero Conversions = Pricing/Landing Page Problem**

Thailand has 21.60% CTR (excellent) but 0 conversions. This means:
- Ads are compelling (people click)
- Keywords have intent (right audience)
- Something happens AFTER the click that stops purchase

Hypothesis: Price is too high compared to competitors seen during research.

### eSIM-Go Catalog Discovery

**Bundle Structure Discovered:**

| Group | Bundles | Durations | Description |
|-------|---------|-----------|-------------|
| Standard Fixed | 370 | 7d, 15d | Data-capped (1GB, 2GB) |
| Standard Unlimited Lite | 210 | 1d | Basic unlimited |
| Standard Unlimited Essential | 210 | 1d, 3d | Better unlimited (CURRENT) |
| Standard Unlimited Plus | 210 | 1d | Premium unlimited |

**Current Sync**: Only pulling "Standard Unlimited Essential" with 1-day and 3-day plans.

**Japan Bundles Available:**

| Bundle | Duration | Data | Wholesale USD |
|--------|----------|------|---------------|
| esim_1GB_7D_JP_V2 | 7 days | 1GB | $2.08 |
| esim_2GB_15D_JP_V2 | 15 days | 2GB | $3.37 |
| esim_UL_1D_JP_V2 | 1 day | Unlimited | $2.24 |
| esim_ULE_1D_JP_V2 | 1 day | Unlimited | $2.69 |
| esim_ULE_3D_JP_V2 | 3 days | Unlimited | $6.54 |
| esim_ULP_1D_JP_V2 | 1 day | Unlimited | $5.38 |

### Competitor Pricing Research

**Japan 7-Day Plans (USD):**

| Provider | Budget Tier | Standard | Unlimited |
|----------|-------------|----------|-----------|
| Airalo | $4.50 (1GB) | $11.50 (5GB) | N/A |
| Holafly | - | - | $27.30 |
| Saily | $3.99 (1GB) | $10.99 (5GB) | - |
| Nomad | $4.50 (1GB) | $14 (5GB) | - |

**Key Insight**: Competitors offer tiered pricing starting at ~$4-5 for budget option.

---

## Decisions Made

### Decision 1: Implement Tiered Pricing

**Date:** 2026-01-26
**Status:** APPROVED
**Owner:** Business owner

**What:** Add budget tier using Standard Fixed bundles alongside unlimited.

**Proposed Tiers:**

| Tier | Data | Bundle | Wholesale | Retail (AUD) |
|------|------|--------|-----------|--------------|
| Light | 1GB/7d | esim_1GB_7D_*_V2 | ~$2 | A$6.99 |
| Standard | 2GB/15d | esim_2GB_15D_*_V2 | ~$3.50 | A$9.99 |
| Unlimited/7d | 7x daily | 7× esim_ULE_1D_*_V2 | ~$18 | A$34.99 |

**Rationale:**
1. Captures price-sensitive searchers (entry at A$6.99 vs A$24.99)
2. Matches competitor pricing structure
3. Allows upselling ("Most Popular" on Standard tier)
4. Higher conversion rate expected with budget option

**Implementation Required:**
- [ ] Update sync script to also pull "Standard Fixed" bundles
- [ ] Update Plan model to support multiple tiers per destination
- [ ] Update pricing page UI to show tier options
- [ ] Update Google Ads with "from A$6.99" messaging

---

### Decision 2: Pause Destination-Specific Ad Groups

**Date:** 2026-01-26
**Status:** APPROVED
**Owner:** Business owner

**What:** Pause Japan, Thailand, Indonesia ad groups until pricing is fixed.

**Rationale:**
- A$343.54 spent on destination ads with 0 conversions
- High CTR proves ads work; issue is post-click
- Wasting budget until landing pages/pricing updated

**Action:**
- [x] Japan eSIM - PAUSE
- [x] Thailand eSIM - PAUSE (was already showing clicks)
- [x] Indonesia eSIM - PAUSE
- [x] Asia eSIM - Already paused
- [x] Europe eSIM - Already paused
- [ ] Travel eSIM - General - KEEP (only converting group)

---

### Decision 3: Add Customer Reviews/Testimonials

**Date:** 2026-01-26
**Status:** APPROVED
**Owner:** Business owner

**What:** Create testimonial content for website and ads.

**Created:** 10 customer review templates in `CUSTOMER_REVIEWS.md`

**Coverage:**
- Destinations: Japan, Thailand, Bali, Singapore, Korea, Vietnam, Malaysia
- Personas: Business, Family, Solo, Backpacker, Short-trip
- Cities: Sydney, Melbourne, Brisbane, Perth, Adelaide, Gold Coast, Canberra

**Usage:**
1. Website testimonial section
2. Google Ads review extensions
3. Landing page social proof

---

### Decision 4: Money-Back Guarantee

**Date:** 2026-01-26
**Status:** APPROVED
**Owner:** Business owner

**What:** Offer money-back guarantee as trust differentiator.

**Rationale:**
1. None of the major competitors offer this
2. Strong differentiator in ad copy
3. Low risk (eSIM refund is straightforward if unused)

**Implementation:**
- [ ] Create guarantee policy page
- [ ] Add badge to checkout page
- [ ] Add to Google Ads headlines

---

### Decision 5: Budget Scaling

**Date:** 2026-01-26
**Status:** APPROVED
**Owner:** Business owner

**What:** Scale Google Ads budget to A$2,000-3,000/month.

**Phase Plan:**

| Phase | Budget | Focus | Success Metric |
|-------|--------|-------|----------------|
| Month 1 | A$2,000 | Japan + Thailand | CPA < A$50 |
| Month 2 | A$2,500 | Add Bali | CPA < A$35 |
| Month 3+ | A$3,000-4,000 | Scale winners | CPA < A$25 |

**Conditions for scaling:**
- Must achieve positive ROAS before increasing budget
- Weekly review of CPA trends
- Pause underperformers quickly

---

## Pending Decisions

### Pending: Update Sync Script for Tiered Bundles

**Status:** NEEDS IMPLEMENTATION

**Task:** Modify `prisma/sync-esimgo.ts` to:
1. Pull "Standard Fixed" bundles in addition to "Standard Unlimited Essential"
2. Store multiple tiers per destination
3. Update Plan model to support tier selection

---

### Pending: Landing Page Redesign

**Status:** NEEDS DESIGN

**Requirements:**
1. Show 3 price tiers clearly (Light / Standard / Unlimited)
2. Add "Australian Owned" badge
3. Add trust indicators (reviews, guarantee)
4. Add live chat widget
5. Show savings vs Telstra roaming

---

## Metrics to Track

### Weekly KPIs

| Metric | Jan 26 Baseline | Feb 14 Current | Target |
|--------|-----------------|----------------|--------|
| CPA | A$405 | A$156 | <A$30 |
| ROAS | 12% | 28% | >300% |
| Conv Rate | 1.28% | 3.07% | >4% |
| CTR | 6.33% | 13.88% | >10% |

### Monthly Review Checklist

- [ ] Search terms report (add negatives)
- [ ] Ad performance (pause low CTR)
- [ ] Landing page analytics (GA4)
- [ ] Competitor pricing check
- [ ] Keyword quality scores

---

## Implementation Log

### 2026-01-26 - Tiered Pricing & Market Expansion Implementation

**Status:** COMPLETED

**Summary:** Implemented tiered pricing system and expanded to Canada (en-ca) and New Zealand (en-nz) markets.

#### Technical Changes

**1. Type System Updates (`types/index.ts`)**
- Added `DataTier` type: `'unlimited' | '1gb' | '2gb' | '3gb' | '5gb' | '10gb'`
- Extended `DurationOption` interface with:
  - `data_type: DataTier` - The data tier category
  - `data_amount_mb?: number` - Data amount in MB (null for unlimited)

**2. eSIM-Go Sync Script (`prisma/sync-esimgo.ts`)**
- Changed `BUNDLE_GROUP` to `BUNDLE_GROUPS` array: `['Standard Unlimited Essential', 'Standard Fixed']`
- Added CAD (1.36) and NZD (1.68) exchange rates
- Added en-ca and en-nz locales with currency mappings
- Added competitor data: Rogers (CAD $18/day), Spark (NZD $2.14/day)
- Added `getDataTier()` helper function to parse bundle names
- Updated `fetchCatalog()` to iterate through multiple bundle groups
- Updated `findAllBundlesForCountry()` to return Map with composite keys (duration-tier)
- Updated `syncPlans()` to include `data_type` and `data_amount_mb` in duration options

**3. UI Components**
- `DestinationPlanCard.tsx`:
  - Added `dataType` and `dataAmountMb` props
  - Added `getDataLabel()` helper function
  - Dynamic data label in features list (e.g., "1GB data", "Unlimited data")
  - Passes `dataType` to checkout API
- `DestinationPlansSection.tsx`:
  - Updated `Plan` interface with `dataType` and `dataAmountMb`
  - Added `getDataLabel()` helper for compact cards
  - Data tier badges on compact plan cards
  - Color-coded badges: brand colors for unlimited, neutral for capped

**4. Checkout API (`app/api/checkout/route.ts`)**
- Added `dataType` parameter to request body
- Updated duration matching: matches on duration + data_type when provided
- Dynamic product description based on data tier
- Added `data_type` and `data_amount_mb` to Stripe metadata

**5. Internationalization**
- Updated `i18n/routing.ts` with new locales: `en-ca`, `en-nz`
- Updated `Locale` type in `types/index.ts`
- Created `messages/en-ca.json`:
  - Canadian English messaging
  - Rogers competitor reference
  - CAD currency references
- Created `messages/en-nz.json`:
  - Kiwi English messaging ("travellers", "Kiwis")
  - Spark competitor reference
  - NZD currency references

#### Margin Analysis

| Tier | Wholesale USD | Retail AUD | Margin % |
|------|---------------|------------|----------|
| Light (1GB/7d) | $2.08 | A$6.99 | 117% |
| Standard (2GB/15d) | $3.37 | A$9.99 | 91% |
| Unlimited (7d) | ~$18.83 | A$34.99 | 20% |

**Note:** 7-day unlimited margin (20%) is below the 50% floor target. Consider either:
- Pricing at A$44.99 for 50% margin
- Accepting lower margin for competitive positioning
- Only offering unlimited in 1-day and 3-day durations

#### Next Steps to Run

1. Run sync script to populate database: `npx ts-node prisma/sync-esimgo.ts`
2. Test checkout flow with each data tier
3. Update Google Ads messaging: "Japan eSIM from A$6.99"
4. Create Stripe test orders for each tier
5. Monitor conversion rate changes after pricing launch

---

## Files Created/Modified

| Date | File | Action | Notes |
|------|------|--------|-------|
| 2026-01-26 | `marketing/googleSEM/MARKETING_PLAN_2026.md` | Created | Full strategy doc |
| 2026-01-26 | `marketing/googleSEM/CUSTOMER_REVIEWS.md` | Created | 10 testimonials |
| 2026-01-26 | `marketing/googleSEM/CHANGELOG.md` | Created | This file |
| 2026-01-26 | `CLAUDE.md` | Updated | Added marketing section |
| 2026-01-26 | `types/index.ts` | Updated | Added DataTier type, extended DurationOption |
| 2026-01-26 | `prisma/sync-esimgo.ts` | Updated | Multi-group sync, CAD/NZD support |
| 2026-01-26 | `i18n/routing.ts` | Updated | Added en-ca, en-nz locales |
| 2026-01-26 | `messages/en-ca.json` | Created | Canadian English translations |
| 2026-01-26 | `messages/en-nz.json` | Created | New Zealand English translations |
| 2026-01-26 | `app/[locale]/[destination]/DestinationPlanCard.tsx` | Updated | Data tier display |
| 2026-01-26 | `app/[locale]/[destination]/DestinationPlansSection.tsx` | Updated | Tier badges, props |
| 2026-01-26 | `app/api/checkout/route.ts` | Updated | Data tier support |

---

## Next Steps

1. **Immediate (This Week)**
   - Implement tiered pricing in code
   - Update landing pages with new price display
   - Add customer reviews to website
   - Create money-back guarantee page

2. **Week 2**
   - Re-enable Japan ad group with "from A$6.99" messaging
   - Add new transactional keywords
   - Set up A/B test on landing page

3. **Week 3-4**
   - Re-enable Thailand ad group
   - Review first 2 weeks of data
   - Adjust bids based on performance

---

*Last updated: 2026-02-14*
