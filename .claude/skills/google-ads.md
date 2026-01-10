# Google Ads Management Skill

## Purpose
Help manage and optimize Google Ads campaigns for Trvel eSIM business.

## Current Campaign Structure
- **Campaign**: Search - Travel eSIM - AU
- **Budget**: A$50/day (recommend reducing to A$20-30/day while optimizing)
- **Bid Strategy**: Maximize conversions
- **Target Market**: Australia (en-au locale)

## Ad Groups
| Ad Group | Keywords | Landing Page |
|----------|----------|--------------|
| Travel eSIM - General | travel esim, esim for travel | /en-au |
| Japan eSIM | japan esim, japan travel sim | /en-au/japan |
| USA eSIM | usa esim, america esim | /en-au/united-states |
| Europe eSIM | europe esim, eu travel sim | /en-au/destinations#europe |
| Asia eSIM | bali esim, thailand esim | /en-au/[country] |

## URL Mapping (CRITICAL)
Always use these correct URLs:
- Homepage: `https://www.trvel.co/en-au`
- Japan: `https://www.trvel.co/en-au/japan`
- USA: `https://www.trvel.co/en-au/united-states` (NOT /usa)
- UK: `https://www.trvel.co/en-au/united-kingdom`
- Europe: `https://www.trvel.co/en-au/destinations#europe`
- All destinations: `https://www.trvel.co/en-au/destinations`

## Keyword Strategy

### Match Types (Priority Order)
1. **Exact Match** [keyword] - Use first, highest intent
2. **Phrase Match** "keyword" - Add after proving exact works
3. **Broad Match** keyword - Only after 200+ conversions with Smart Bidding

### High-Intent Keywords (Priority)
```
[japan esim]
[thailand esim]
[indonesia esim]
[bali esim]
[singapore esim]
[korea esim]
```

### Avoid (Low Intent / High Competition)
- Generic "esim" alone
- "free esim"
- "esim plans" (comparison shoppers)
- Competitor brand names

## Conversion Tracking
- Server-side tracking via Stripe webhook
- Sends to Google Ads API + GA4
- Bypasses ad blockers and iOS tracking prevention
- GCLID stored in localStorage, passed through checkout

## Performance Benchmarks
| Metric | Target | Current |
|--------|--------|---------|
| CTR | >5% | 6.32% ✅ |
| CPC | <$5 AUD | $5.71 ⚠️ |
| Conv Rate | >3% | 3.33% ✅ |
| ROAS | >2.0 | 0.26 ❌ |
| Cost/Conv | <$30 | $171 ❌ |

## Optimization Checklist
- [ ] All ad URLs are valid and working
- [ ] Exact match keywords only (initially)
- [ ] Geographic targeting set correctly (Australia)
- [ ] Ad schedule aligned with purchase times
- [ ] Negative keywords added for irrelevant searches
- [ ] Extensions enabled (sitelinks, callouts, structured snippets)

## Do NOT
- Turn on auto-apply recommendations
- Add broad match keywords (until profitable)
- Enable Performance Max (until 200+ conversions)
- Chase optimization score (it's a vanity metric)
- Trust Google's keyword suggestions blindly

## Files Reference
- Keywords CSV: `marketing/google-ads-keywords-with-urls.csv`
- Conversion tracking: `lib/google-ads.ts`
- GCLID capture: `hooks/useGclid.ts`, `components/GoogleAdsCapture.tsx`
