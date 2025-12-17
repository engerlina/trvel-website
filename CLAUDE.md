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
