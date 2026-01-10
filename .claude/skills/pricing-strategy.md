# Pricing Strategy Skill

## Purpose
Manage Trvel's pricing strategy for eSIM plans across destinations and locales.

## Current Pricing Model

### Plan Structure (All Unlimited Data)
| Duration | Plan Name | Target Use Case |
|----------|-----------|-----------------|
| 1 day | 1-Day Quick Trip | Day trips, layovers |
| 3 days | 3-Day Getaway | Weekend trips |
| 5 days | Quick Trip | Short holidays |
| 7 days | Week Explorer | Standard vacation |
| 10 days | 10-Day Adventure | Extended trip |
| 15 days | Extended Stay | Long vacation |
| 30 days | Monthly Traveler | Business/long stay |

### Default Display
By default, show 3 durations: **5, 7, 15 days**
(Can be overridden per destination based on availability)

## Pricing Formula

```typescript
// Step 1: Base price (60% markup)
basePrice = wholesale × 1.60

// Step 2: Competitor cap (10% under their trip cost)
competitorCap = competitorDailyRate × days × 0.90

// Step 3: Minimum floor (50% margin)
floorPrice = wholesale × 1.50

// Final price
finalPrice = max(min(basePrice, competitorCap), floorPrice)

// Round to friendly ending (.99 or .49, or 900 for IDR)
```

## Multi-Currency Support

| Locale | Currency | Exchange Rate (from USD) |
|--------|----------|--------------------------|
| en-au | AUD | 1.55 |
| en-sg | SGD | 1.34 |
| en-gb | GBP | 0.79 |
| en-us | USD | 1.00 |
| ms-my | MYR | 4.47 |
| id-id | IDR | 15,800 |

## Future: Data-Capped Tiers

### Proposed Tier Structure
| Tier | Data | Duration | Positioning |
|------|------|----------|-------------|
| Entry | 3GB | 7 days | Break-even, acquisition |
| Standard | 10GB | 15 days | Main profit driver |
| Premium | Unlimited | 30 days | AOV booster |

### Implementation Requirements
1. Query eSIM Go for non-unlimited bundles (different group)
2. Update `sync-esimgo.ts` to pull capped bundles
3. Update UI to show data amounts
4. Update checkout flow for tier selection

## Promotional Pricing

### Stripe Coupon Types
- **Percentage off**: 10%, 15%, 20%
- **Fixed amount**: $5 off, $10 off
- **First purchase**: New customer discounts

### Promo Code Strategy
- Launch promos: LAUNCH20 (20% off)
- Seasonal: SUMMER15, WINTER10
- Destination-specific: JAPAN10
- Referral codes: [USER]REF

## Price Display Rules

### Formatting by Currency
```typescript
AUD: $29.99
SGD: S$25.99
GBP: £19.99
USD: $24.99
MYR: RM89.99
IDR: Rp299,900
```

### Comparison Messaging
Show savings vs competitor:
"Save $XX vs Telstra roaming"
"70% cheaper than carrier rates"

## Sync Commands
```bash
# Update prices from eSIM Go
npx tsx prisma/sync-esimgo.ts

# Generate Prisma client
npm run db:generate
```

## Files Reference
- Sync script: `prisma/sync-esimgo.ts`
- Plan schema: `prisma/schema.prisma`
- Checkout: `app/api/checkout/route.ts`
- Price display: `components/` (PricingCard, etc.)
