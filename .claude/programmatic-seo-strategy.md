# Programmatic SEO Strategy for Trvel

## Executive Summary

Based on research from [Backlinko](https://backlinko.com/programmatic-seo), [Stan Ventures](https://www.stanventures.com/industries/seo-for-esim-companies/), and analysis of competitors like Airalo and Holafly, this document outlines a programmatic SEO strategy to scale Trvel's organic traffic.

**Critical Warning**: 93% of penalized programmatic SEO sites lacked unique data differentiation. Success requires unique value, not just template variations.

---

## Opportunity Analysis

### Market Context
- Global eSIM market: $11.93B (2024) → $45.39B (2033)
- 503M+ eSIM units shipped in 2024 (35% YoY growth)
- Competitors (Airalo, Holafly) cover 200+ destinations with programmatic pages

### Trvel's Unique Advantages for pSEO
1. **Local Currency Pricing** - Real AUD/SGD/GBP/MYR/IDR prices (competitors use USD)
2. **Carrier Roaming Comparisons** - Telstra/Singtel/EE actual rates vs eSIM
3. **eSIM-Go Catalog Data** - Actual bundle prices, speeds, durations
4. **Locale-Specific Content** - Native language support (Bahasa, etc.)

---

## Page Types to Generate

### Tier 1: High Intent Destination Pages (500+ pages)

**Pattern**: `/{locale}/esim/{destination-slug}`

**Formula**: `[destination] esim [origin]` or `esim for [destination]`

**Data Required**:
- All destinations from eSIM-Go catalog (~100+ countries)
- Cross-multiply with 5 locales = 500+ unique pages
- Each page shows local currency pricing

**Unique Value per Page**:
- Real-time pricing in local currency
- Carrier roaming comparison calculator
- Network coverage map
- Local carrier partners
- Speed test data (4G/5G availability)

**Example URLs**:
- `/en-au/esim/japan` - "Japan eSIM for Australians"
- `/en-sg/esim/vietnam` - "Vietnam eSIM from Singapore"
- `/ms-my/esim/jepun` - "eSIM Jepun dari Malaysia"

### Tier 2: City-Specific Landing Pages (2,000+ pages)

**Pattern**: `/{locale}/esim/{country}/{city}`

**Formula**: `esim for [city]` or `[city] data plan`

**Target Keywords**:
- "Tokyo eSIM"
- "Bangkok data plan"
- "Bali internet SIM"
- "Seoul mobile data"

**Unique Value per Page**:
- City-specific network coverage notes
- Popular areas/landmarks connectivity info
- Airport pickup alternatives
- Local tips for connectivity

**Example URLs**:
- `/en-au/esim/japan/tokyo`
- `/en-sg/esim/thailand/bangkok`
- `/en-gb/esim/spain/barcelona`

### Tier 3: Duration-Based Pages (1,500+ pages)

**Pattern**: `/{locale}/esim/{destination}/{duration}-day`

**Formula**: `[destination] [X] day esim` or `[X] day data plan [destination]`

**Data Required**:
- Destinations × Durations (5, 7, 15, 30 days) × Locales
- Real pricing for each duration tier

**Example URLs**:
- `/en-au/esim/japan/7-day` - "Japan 7-Day eSIM Plan"
- `/en-sg/esim/korea/15-day` - "Korea 15-Day Data Plan"

### Tier 4: Comparison Pages (100+ pages)

**Pattern**: `/{locale}/compare/{carrier}-vs-esim-{destination}`

**Formula**: `[carrier] roaming vs esim [destination]`

**Target Keywords**:
- "Telstra roaming Japan vs eSIM"
- "Singtel roaming Thailand alternative"
- "EE roaming USA comparison"

**Unique Value**:
- Actual carrier roaming rates (from Competitor model)
- Side-by-side cost calculator
- Savings amount highlighted

**Example URLs**:
- `/en-au/compare/telstra-vs-esim-japan`
- `/en-sg/compare/singtel-vs-esim-thailand`

### Tier 5: Device Compatibility Pages (200+ pages)

**Pattern**: `/{locale}/compatibility/{brand}/{device}`

**Formula**: `esim [device]` or `[device] esim compatible`

**Data Source**: Device and DeviceBrand models in database

**Example URLs**:
- `/en-au/compatibility/apple/iphone-15-pro`
- `/en-sg/compatibility/samsung/galaxy-s24`

---

## Database Schema Extensions

```prisma
// Existing models used:
// - EsimBundle (destinations, pricing, coverage)
// - Plan (locale-specific pricing)
// - Destination (localized names)
// - Competitor (carrier roaming rates)
// - Device, DeviceBrand (compatibility)

// New model for cities
model City {
  id              Int      @id @default(autoincrement())
  slug            String   @db.VarChar(100)
  locale          String   @db.VarChar(10)
  name            String   @db.VarChar(100)
  country_iso     String   @db.Char(2)
  destination_id  Int?
  destination     Destination? @relation(fields: [destination_id], references: [id])

  // Unique content for each city
  airport_code    String?  @db.VarChar(10)
  connectivity_notes String? @db.Text
  popular_areas   String[] // Array of popular areas
  network_quality Int?     // 1-5 rating

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([slug, locale])
  @@index([country_iso])
}

// SEO metadata for programmatic pages
model SeoPage {
  id              Int      @id @default(autoincrement())
  page_type       String   @db.VarChar(50) // destination, city, duration, comparison, device
  slug            String   @db.VarChar(200)
  locale          String   @db.VarChar(10)

  // SEO fields
  title           String   @db.VarChar(70)
  meta_description String  @db.VarChar(160)
  h1              String   @db.VarChar(100)

  // Content blocks (JSON for flexibility)
  content_blocks  Json?

  // Tracking
  indexed_at      DateTime?
  last_crawled    DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([page_type, slug, locale])
  @@index([page_type])
  @@index([locale])
}
```

---

## Page Template Structure

### Destination Page Template

```
/{locale}/esim/{destination}

┌─────────────────────────────────────────────────────────┐
│ H1: {Destination} eSIM for {Demonym} Travelers          │
│ Hero: Map + instant pricing in {currency}               │
├─────────────────────────────────────────────────────────┤
│ Pricing Cards: 5-day | 7-day | 15-day                   │
│ (Real prices from Plan model)                           │
├─────────────────────────────────────────────────────────┤
│ Roaming Comparison Calculator                           │
│ "{Carrier} would cost {X} for this trip"               │
│ "You save {savings} with Trvel"                        │
├─────────────────────────────────────────────────────────┤
│ Coverage Details:                                       │
│ - Networks: {carrier names from EsimBundle}             │
│ - Speeds: {4G/5G badges}                               │
│ - Data: {unlimited or cap}                             │
├─────────────────────────────────────────────────────────┤
│ How It Works (3 steps)                                  │
├─────────────────────────────────────────────────────────┤
│ Popular Cities: {links to city pages}                   │
├─────────────────────────────────────────────────────────┤
│ FAQs (destination-specific)                             │
├─────────────────────────────────────────────────────────┤
│ Related Destinations                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Data Enrichment (Week 1-2)
1. Extend Prisma schema with City and SeoPage models
2. Populate cities for top 50 destinations
3. Verify Competitor roaming rates are current
4. Create content generation templates

### Phase 2: Core Templates (Week 2-3)
1. Build destination page template (`/esim/[destination]`)
2. Build city page template (`/esim/[destination]/[city]`)
3. Build comparison page template (`/compare/[carrier]-vs-esim-[destination]`)
4. Implement generateStaticParams for all routes

### Phase 3: SEO Infrastructure (Week 3-4)
1. Generate XML sitemaps per page type
2. Implement internal linking mesh
3. Add JSON-LD structured data (Product, FAQ, BreadcrumbList)
4. Set up canonical URLs and hreflang tags

### Phase 4: Content Generation (Week 4-5)
1. Use AI to generate unique intro paragraphs per page
2. Generate destination-specific FAQs
3. Create city connectivity guides
4. Build comparison calculator widget

### Phase 5: Launch & Monitor (Week 5+)
1. Submit sitemaps to Google Search Console
2. Monitor indexing rates
3. Track rankings for target keywords
4. A/B test page layouts

---

## Technical Implementation

### Dynamic Route Structure

```
app/[locale]/
├── esim/
│   ├── [destination]/
│   │   ├── page.tsx              # Destination landing
│   │   ├── [city]/
│   │   │   └── page.tsx          # City-specific
│   │   └── [duration]-day/
│   │       └── page.tsx          # Duration-specific
├── compare/
│   └── [comparison]/
│       └── page.tsx              # Carrier comparison
└── compatibility/
    └── [brand]/
        └── [device]/
            └── page.tsx          # Device pages
```

### generateStaticParams Example

```typescript
// app/[locale]/esim/[destination]/page.tsx
export async function generateStaticParams() {
  const destinations = await prisma.destination.findMany({
    select: { slug: true, locale: true }
  });

  return destinations.map(d => ({
    locale: d.locale,
    destination: d.slug
  }));
}
```

### Metadata Generation

```typescript
export async function generateMetadata({ params }) {
  const { locale, destination } = params;
  const dest = await getDestination(destination, locale);
  const plan = await getPlan(destination, locale);

  return {
    title: `${dest.name} eSIM - ${formatPrice(plan.price_5day)} | Trvel`,
    description: `Get instant data in ${dest.name}. Plans from ${formatPrice(plan.price_5day)}. Works on arrival. Better than ${getCarrier(locale)} roaming.`,
    alternates: {
      canonical: `https://trvel.app/${locale}/esim/${destination}`,
      languages: getHreflangAlternates(destination)
    }
  };
}
```

---

## Unique Value Differentiation

To avoid thin content penalties, each page MUST have:

| Page Type | Unique Data | Source |
|-----------|-------------|--------|
| Destination | Local currency price | Plan model |
| Destination | Carrier savings calc | Competitor model |
| Destination | Network coverage | EsimBundle model |
| City | Connectivity notes | City model (manual) |
| City | Popular areas | City model (manual) |
| Comparison | Actual roaming rates | Competitor model |
| Comparison | Savings calculator | Computed |
| Device | Compatibility status | Device model |
| Device | Setup instructions | DeviceBrand model |

---

## Risk Mitigation

### Avoid These Mistakes
1. **Identical content** - Every page must have unique, valuable data
2. **Thin pages** - Minimum 500 words of useful content per page
3. **No internal linking** - Build a mesh of related page links
4. **Ignoring E-E-A-T** - Add author attribution, citations, expertise signals
5. **Keyword stuffing** - Write naturally, focus on user intent

### Quality Checklist
- [ ] Does this page answer a real user question?
- [ ] Is there unique data not available elsewhere?
- [ ] Would a user bookmark this page?
- [ ] Is the pricing accurate and current?
- [ ] Are there clear CTAs to purchase?

---

## Expected Outcomes

### Traffic Projections (Conservative)
- Tier 1 Destinations: 500 pages × 50 visits/month = 25,000 visits
- Tier 2 Cities: 2,000 pages × 20 visits/month = 40,000 visits
- Tier 3 Duration: 1,500 pages × 10 visits/month = 15,000 visits
- Tier 4 Comparison: 100 pages × 100 visits/month = 10,000 visits
- Tier 5 Device: 200 pages × 30 visits/month = 6,000 visits

**Total: ~96,000 additional monthly organic visits**

### Conversion Impact
- At 2% conversion rate: 1,920 additional sales/month
- At $20 AOV: $38,400 additional monthly revenue

---

## Sources & References

- [Backlinko: Programmatic SEO Guide](https://backlinko.com/programmatic-seo)
- [GrackerAI: pSEO Case Studies 2025](https://gracker.ai/blog/10-programmatic-seo-case-studies--examples-in-2025)
- [Stan Ventures: SEO for eSIM Companies](https://www.stanventures.com/industries/seo-for-esim-companies/)
- [Passionfruit: Programmatic SEO Without Traffic Loss](https://www.getpassionfruit.com/blog/programmatic-seo-traffic-cliff-guide)
- IMARC Group eSIM Market Report 2024
