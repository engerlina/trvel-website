# Business Intelligence Skill

## Purpose
Analyze Trvel business performance, identify profitable destinations, and guide strategic decisions.

## Key Metrics

### Unit Economics
| Metric | Formula | Target |
|--------|---------|--------|
| AOV (Average Order Value) | Revenue / Orders | >$40 AUD |
| CAC (Customer Acquisition Cost) | Ad Spend / Conversions | <$30 AUD |
| Gross Margin | (Revenue - Wholesale) / Revenue | >50% |
| ROAS | Conversion Value / Ad Spend | >2.0 |
| LTV | AOV × Repeat Rate | Track over time |

### Per-Destination Analysis
Track for each destination:
- Number of orders
- Total revenue
- Wholesale cost (from eSIM Go)
- Gross margin
- Refund rate
- Google Ads CPA

## Database Queries

### Orders by Destination
```sql
SELECT
  destination_slug,
  destination_name,
  COUNT(*) as orders,
  SUM(amount_cents)/100 as revenue,
  AVG(amount_cents)/100 as aov
FROM "Order"
WHERE status = 'paid'
GROUP BY destination_slug, destination_name
ORDER BY orders DESC;
```

### Daily Revenue
```sql
SELECT
  DATE(paidAt) as date,
  COUNT(*) as orders,
  SUM(amount_cents)/100 as revenue
FROM "Order"
WHERE status = 'paid'
GROUP BY DATE(paidAt)
ORDER BY date DESC;
```

### Customers with Repeat Purchases
```sql
SELECT
  c.email,
  c.name,
  COUNT(o.id) as order_count,
  SUM(o.amount_cents)/100 as total_spent
FROM "Customer" c
JOIN "Order" o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id, c.email, c.name
HAVING COUNT(o.id) > 1
ORDER BY order_count DESC;
```

## Profitability Analysis

### Wholesale Costs (from eSIM Go sync)
Stored in `EsimBundle.price_usd_cents` per bundle.

### Retail Pricing Formula
```
Base Price = Wholesale × 1.60 (60% markup)
Target Price = Competitor Daily Rate × Days × 0.90 (10% under)
Floor Price = Wholesale × 1.50 (50% minimum margin)

Final = max(min(Base, Target), Floor)
```

### Competitor Benchmarks
| Currency | Competitor | Daily Rate |
|----------|------------|------------|
| AUD | Telstra | $10/day |
| SGD | Singtel | $15/day |
| GBP | EE | £3.54/day |
| USD | T-Mobile | $15/day |
| MYR | Maxis | RM35/day |
| IDR | Telkomsel | Rp100,000/day |

## Geographic Expansion Map

### Priority Tiers (Based on AU Travel Patterns)
**Tier 1 (Launch Markets)**
- Japan, Thailand, Indonesia, Singapore, South Korea

**Tier 2 (High Volume)**
- Vietnam, Malaysia, Philippines, United States, United Kingdom

**Tier 3 (Growth)**
- France, Italy, New Zealand, Hong Kong, Taiwan

**Tier 4 (Long Tail)**
- All other 175+ destinations

## Files Reference
- Pricing sync: `prisma/sync-esimgo.ts`
- Plan data: `prisma/schema.prisma` (Plan model)
- Order data: `prisma/schema.prisma` (Order model)
- Admin dashboard: `app/admin/`
