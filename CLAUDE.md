# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000
npm run build            # Production build
npm run lint             # Run ESLint

# Database (Prisma + Supabase PostgreSQL)
npm run db:generate      # Generate Prisma client after schema changes
npm run db:push          # Push schema to database (no migration files)
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio GUI
```

## Architecture

### Internationalization (next-intl)
- All routes are prefixed with locale: `/[locale]/...`
- Supported locales: `en-au` (default), `en-sg`, `en-gb`, `ms-my`, `id-id`, `en-us`
- Translation files: `messages/{locale}.json`
- Locale routing defined in `i18n/routing.ts` - exports `Link`, `redirect`, `usePathname`, `useRouter`
- Use `getTranslations()` in server components, `useTranslations()` in client components
- Middleware handles locale detection and redirects

### Database Models (Prisma)
All models use composite unique constraints on `[slug/destination_slug, locale]` for locale-specific content:
- **Plan**: Pricing per destination+locale (5/7/15-day plans with currency)
- **Destination**: Localized destination content
- **Post**: Blog posts with locale support

### Key Files
- `lib/db.ts` - Singleton Prisma client
- `lib/stripe.ts` - Server (`stripe`) and client (`getStripe()`) Stripe instances
- `lib/supabase.ts` - Server (`createServerSupabaseClient`), client (`createClientSupabaseClient`), and direct (`supabase`) clients
- `types/index.ts` - Shared TypeScript types including `Locale` type

### Route Structure
```
app/[locale]/
  page.tsx              # Homepage
  [destination]/page.tsx  # Destination pages (dynamic)
  blog/[slug]/page.tsx   # Blog posts (dynamic)
  checkout/page.tsx      # Checkout flow
```

### Environment Variables Required
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase auth
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payments

## MCP Tools Available

Use these tools when appropriate for research, SEO analysis, and web scraping:

### Firecrawl (`firecrawl-mcp`)
- **Use for**: Web scraping, site crawling, content extraction
- **When to use**: Extracting content from competitor sites, scraping travel information, gathering pricing data from other eSIM providers

### Perplexity (`perplexity`)
- **Use for**: AI-powered web search with citations
- **When to use**: Researching travel destinations, finding up-to-date information about eSIM compatibility, answering questions about travel regulations or requirements

### DataForSEO (`dataforseo`)
- **Use for**: SEO data and analysis
- **Available APIs**:
  - SERP data (Google, Bing, Yahoo rankings)
  - Keyword research & search volume
  - Backlink analysis
  - On-page SEO metrics
  - Domain analytics
  - Content analysis
- **When to use**: Analyzing keyword opportunities for destinations, checking SERP rankings, competitor backlink analysis, content optimization suggestions

## AWS S3 - Blog Images

Blog images are stored in AWS S3 for fast global delivery.

### Configuration

- **Bucket**: `trvel-s3`
- **Region**: `ap-southeast-2` (Sydney)
- **Public URL pattern**: `https://trvel-s3.s3.ap-southeast-2.amazonaws.com/{path}`

### Usage

- Upload blog images to `blog/` folder in the bucket
- Reference in blog posts: `https://trvel-s3.s3.ap-southeast-2.amazonaws.com/blog/image-name.jpg`
- Supported formats: JPG, PNG, WebP (prefer WebP for performance)

## Stripe Payments

### Architecture: Dynamic Pricing

The checkout uses **dynamic pricing** with `price_data` instead of pre-created Stripe Products/Prices. This approach is chosen because:

1. **Scale**: 190 destinations × 6 locales × 3 durations = 3,420 unique prices would be unmanageable
2. **Multi-currency**: Each locale has different currency (AUD, SGD, GBP, MYR, IDR, USD)
3. **Price updates**: Prices calculated from exchange rates can change frequently

### How It Works

1. User clicks "Buy" button with destination + duration + locale
2. `/api/checkout` fetches price from `Plan` table in database
3. Stripe Checkout Session created with `price_data` (no pre-created Price ID needed)
4. Product appears in Stripe as "Japan eSIM - Week Explorer" etc.
5. Webhook receives payment → creates Order → provisions eSIM

### Stripe Files

- `app/api/checkout/route.ts` - Creates Stripe Checkout session with dynamic pricing
- `app/api/webhooks/stripe/route.ts` - Handles payment success/failure webhooks
- `lib/stripe.ts` - Stripe client configuration (supports TEST_MODE)

### Stripe Environment Variables

```bash
# Production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Test mode (set TEST_MODE=true to use these)
TEST_MODE=true
TEST_STRIPE_SECRET_KEY=sk_test_...
TEST_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
TEST_STRIPE_WEBHOOK_SECRET=whsec_...
```

### Promotion Codes

- Coupons/Promotion codes are managed in Stripe Dashboard
- Checkout automatically allows customers to enter promo codes
- Can also pass `promoCode` param to pre-apply a code

## Google Ads & GA4 Conversion Tracking

Server-side conversion tracking that bypasses ad blockers, iOS tracking prevention, Safari cookie deletion, and Stripe redirect attribution loss.

### Architecture

```
User clicks Google Ad (with ?gclid=...)
  → Website captures gclid in localStorage (GoogleAdsCapture.tsx)
  → User starts checkout, gclid passed to /api/checkout
  → Stripe Checkout stores gclid as client_reference_id
  → Payment succeeds, Stripe webhook fires
  → Webhook extracts gclid from session.client_reference_id
  → Server sends conversion to Google Ads API + GA4 Measurement Protocol
```

### Key Files

- `lib/google-ads.ts` - Google Ads Conversion API utility
- `lib/ga4.ts` - GA4 Measurement Protocol utility
- `hooks/useGclid.ts` - Client-side gclid capture and storage
- `components/GoogleAdsCapture.tsx` - Invisible component in root layout
- `app/api/webhooks/stripe/route.ts` - Sends conversions after payment

### Environment Variables

```bash
# Google Ads Conversion API
GOOGLE_ADS_CUSTOMER_ID="123-456-7890"
GOOGLE_ADS_CONVERSION_ACTION_ID="987654321"
GOOGLE_ADS_DEVELOPER_TOKEN="your_developer_token"
GOOGLE_ADS_CLIENT_ID="your_oauth_client_id"
GOOGLE_ADS_CLIENT_SECRET="your_oauth_client_secret"
GOOGLE_ADS_REFRESH_TOKEN="your_oauth_refresh_token"

# GA4 Measurement Protocol
GA4_API_SECRET="your_ga4_api_secret"
```

### Setup Instructions

1. **Google Ads Conversion Action**:
   - Go to Google Ads > Goals > Conversions > New conversion action
   - Choose "Import" > "Other data sources" > "Track conversions from clicks"
   - Note the Conversion Action ID

2. **Google Ads API Access**:
   - Apply for API access at Google Ads API Center
   - Create OAuth credentials in Google Cloud Console
   - Generate refresh token using Google's OAuth Playground

3. **GA4 API Secret**:
   - Go to GA4 Admin > Data Streams > Your Stream
   - Click "Measurement Protocol API secrets"
   - Create a new secret

---

## Google Ads Marketing Strategy

### Current Campaign Status (Jan 2026)

**Account ID**: 866-912-6474 (managed under 269-656-6360)

**Performance Summary** (Dec 27, 2025 - Jan 25, 2026):
- Spend: A$1,217.58
- Conversions: 3
- CPA: A$405.86 (target: <A$30)
- ROAS: 11.8% (target: >300%)

**Key Finding**: High CTR (21% Thailand, 9.5% Japan) but 0 conversions on destination-specific ads = pricing/landing page problem, not keyword problem.

### Campaign Structure

```
Account: 866-912-6474
└── Campaign: Search - Travel eSIM - AU
    ├── Ad Group: Travel eSIM - General (CONVERTING - keep)
    ├── Ad Group: Japan eSIM (paused - restructure)
    ├── Ad Group: Thailand eSIM (paused - restructure)
    ├── Ad Group: Indonesia eSIM (paused - restructure)
    ├── Ad Group: Asia eSIM (paused)
    └── Ad Group: Europe eSIM (paused)
```

### eSIM-Go Bundle Structure

The supplier (eSIM-Go) offers these bundle types:

| Group | Description | Durations | Use Case |
|-------|-------------|-----------|----------|
| Standard Fixed | Data-capped (1GB, 2GB) | 7d, 15d | Budget tier |
| Standard Unlimited Lite | Basic unlimited | 1d only | Short trips |
| Standard Unlimited Essential | Better unlimited | 1d, 3d | Current default |
| Standard Unlimited Plus | Premium unlimited | 1d only | Premium tier |

**Key Insight**: No pre-packaged 7-day or 15-day unlimited bundles. Must either:
1. Multiply 1-day prices for longer durations
2. Offer data-capped plans as budget option

### Pricing Strategy

**Current**: Single unlimited tier (from sync of "Standard Unlimited Essential")

**Recommended**: Tiered pricing

| Tier | Data | Wholesale (USD) | Retail (AUD) | Target Customer |
|------|------|-----------------|--------------|-----------------|
| Light | 1GB/7d | $2.08 | A$6.99 | Budget/light users |
| Standard | 2GB/15d | $3.37 | A$9.99 | Moderate users |
| Unlimited/7d | 7× daily | ~$18.83 | A$34.99 | Heavy users |

### Key Marketing Files

```
marketing/
├── googleSEM/
│   ├── MARKETING_PLAN_2026.md      # Comprehensive strategy document
│   ├── CUSTOMER_REVIEWS.md         # 10 testimonial templates
│   ├── CHANGELOG.md                # Decision tracking
│   ├── Ad group report.csv         # Raw performance data
│   └── Time_series_chart*.csv      # Daily metrics
├── google-ads-complete.md          # Ad copy templates
├── google-ads-keywords.csv         # Keyword lists
└── google-ads-negative-keywords.csv # Negative keywords
```

### Ad Copy Guidelines

**Headlines that work** (emphasize these):
- "From A$6.99" (entry price)
- "Australian Owned Support"
- "Money-Back Guarantee"
- "4.9★ Rated"

**Headlines to avoid** (competitors say same thing):
- "Instant QR Code" (everyone says this)
- "No SIM Swap" (expected feature)

### Keyword Strategy

**High-intent (prioritize)**:
- `[buy japan esim]`
- `[order thailand sim]`
- `[australia to japan esim]`

**Origin-specific (unique advantage)**:
- `[telstra roaming alternative japan]`
- `[optus roaming thailand cheaper]`

**Avoid**:
- `[what is esim]` (research intent)
- `[esim vs sim]` (comparison, not buying)

### Budget Allocation

| Phase | Monthly Budget | Focus |
|-------|---------------|-------|
| Month 1 | A$2,000 | Japan + Thailand only |
| Month 2 | A$2,500 | Add Bali |
| Month 3+ | A$3,000-4,000 | Scale winners |

### Scripts & Automation

**Sync eSIM-Go catalog**:
```bash
npx tsx prisma/sync-esimgo.ts
```

This script:
1. Fetches bundles from eSIM-Go API
2. Updates `EsimBundle` table with wholesale prices
3. Calculates retail prices using pricing rules
4. Updates `Plan` table with durations and prices

**Pricing Rules** (in `lib/pricing.ts`):
- 60% markup over wholesale (base)
- Cap at 10% under competitor (Telstra A$10/day)
- Minimum 50% margin floor
- Round to .99 or .49 endings

---

## eSIM-Go Integration

### API Configuration

- **Base URL**: `https://api.esim-go.com/v2.5`
- **Auth**: `X-API-Key` header with `ESIMGO_API_TOKEN`
- **Catalog endpoint**: `/catalogue?group={group}&perPage=100`
- **Order endpoint**: `/orders` (POST)

### Bundle Naming Convention

```
esim_{DATA}_{DURATION}_{COUNTRY}_{VERSION}

Examples:
- esim_1GB_7D_JP_V2      → 1GB, 7 days, Japan
- esim_UL_1D_TH_V2       → Unlimited Lite, 1 day, Thailand
- esim_ULE_3D_JP_V2      → Unlimited Essential, 3 days, Japan
- esim_ULP_1D_KR_V2      → Unlimited Plus, 1 day, Korea
```

### Available Bundles by Destination (Jan 2026)

| Destination | Fixed Data | Unlimited |
|-------------|------------|-----------|
| Japan (JP) | 1GB/7d, 2GB/15d | 1d, 3d |
| Thailand (TH) | 1GB/7d | 1d, 3d |
| Indonesia (ID) | 1GB/7d, 2GB/15d | 1d, 3d |
| Korea (KR) | 1GB/7d, 2GB/15d | 1d, 3d |
| Singapore (SG) | 1GB/7d | 1d, 3d |
| Vietnam (VN) | 1GB/7d | 1d, 3d |
| Malaysia (MY) | 1GB/7d, 2GB/15d | 1d, 3d |

### Order Flow

```
1. Customer selects destination + duration + tier
2. /api/checkout looks up Plan → gets bundle_name
3. Stripe Checkout session created
4. Payment succeeds → webhook fires
5. createEsimOrder(bundle_name, orderRef) called
6. eSIM-Go returns QR code data
7. Customer receives email with QR code
```

---

## Decision Log

Track all marketing and pricing decisions in `marketing/googleSEM/CHANGELOG.md`
