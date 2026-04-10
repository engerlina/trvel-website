# GEO Audit Report: Trvel

**Audit Date:** 2026-04-11
**URL:** https://www.trvel.co
**Business Type:** E-commerce (Travel eSIM)
**Pages Analyzed:** 6 (Homepage, Japan destination, How It Works, Blog index, Reviews, Blog post)

---

## Executive Summary

**Overall GEO Score: 43/100 (Poor)**

Trvel has solid technical foundations (Next.js SSR, all AI crawlers allowed, clean URL structure) but is severely undermined by near-zero brand authority across third-party platforms and minimal structured data beyond the homepage. AI systems like ChatGPT, Perplexity, and Gemini have essentially no training data about Trvel -- the brand appears on zero review platforms, zero Reddit discussions, and zero travel blog roundups. The site's on-page content has moderate citability but lacks original data, verifiable claims, and author credentials that AI models need to confidently cite a source.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 52/100 | 25% | 13.0 |
| Brand Authority | 8/100 | 20% | 1.6 |
| Content E-E-A-T | 52/100 | 20% | 10.4 |
| Technical GEO | 72/100 | 15% | 10.8 |
| Schema & Structured Data | 28/100 | 10% | 2.8 |
| Platform Optimization | 47/100 | 10% | 4.7 |
| **Overall GEO Score** | | | **43.3/100** |

---

## Critical Issues (Fix Immediately)

### 1. Zero Third-Party Brand Presence (Brand Authority: 8/100)
**Impact:** AI models cannot recommend what they've never encountered in training data.

| Platform | Status |
|---|---|
| Trustpilot | Absent |
| Reddit | Zero mentions |
| YouTube | No videos or channel |
| LinkedIn | No company page |
| Wikipedia/Wikidata | No entry |
| Travel blog roundups | Not mentioned in any "Best eSIM" articles |
| ProductReview.com.au | Absent |
| OzBargain | No mentions |

**Action:** Register on Trustpilot immediately. Create LinkedIn company page. Begin Reddit engagement in r/travel, r/esim, r/japantravel. Pursue inclusion in travel blog "Best eSIM" roundup articles.

### 2. No Structured Data on Destination Pages (Schema: 28/100)
**Impact:** Product pages (the money pages) have ZERO schema markup. No rich results possible.

The `JsonLd` component only renders on the homepage. All destination pages (`/en-au/japan`, `/en-au/thailand`, etc.), blog posts, and how-it-works pages have no structured data at all.

**Action:** Create destination-specific Product + FAQPage + BreadcrumbList schema components. Add Article schema to blog posts.

### 3. No llms.txt File
**Impact:** AI systems have no structured guide to site content.

`https://www.trvel.co/llms.txt` returns 404. This emerging standard helps AI crawlers understand site structure and prioritize content.

**Action:** Create and deploy llms.txt at site root.

### 4. Sitemap Only Contains en-au Locale URLs
**Impact:** 5 out of 6 locale variants (en-sg, en-gb, en-us, ms-my, id-id) are invisible to search engines via sitemap. Approximately 750+ URLs missing.

**Action:** Generate sitemap index with per-locale sitemaps.

---

## High Priority Issues

### 5. Unverifiable "50,000+ Reviews" Claim
The site claims "50,000+ verified reviews" and "4.9/5 rating" with zero external platform presence. This is hardcoded in Product schema AggregateRating. Google Quality Raters and AI systems flag unverifiable social proof claims. Risk of manual action.

**Action:** Either substantiate with Trustpilot/Google Reviews integration or reduce to verifiable numbers.

### 6. Blog Content Quality Issues
- 14 of 21 blog posts published simultaneously on Dec 17, 2025 (batch AI generation signal)
- Japan "Ultimate Guide" is only ~450 words (critically thin)
- No original data, speed tests, or coverage maps in any content
- No content published in 2026 (4-month gap)

**Action:** Expand thin posts to 2,000+ words with original data. Consolidate overlapping posts. Establish regular publishing cadence.

### 7. Missing Security Headers
Only HTTPS and HSTS are configured. Missing: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. `X-Powered-By: Next.js` discloses framework.

**Action:** Configure security headers in next.config.js or Vercel settings.

### 8. Homepage 307 Redirect (Should Be 301)
Root URL `/` returns 307 Temporary Redirect to `/en-au`. Temporary redirects don't pass full link equity.

**Action:** Configure next-intl middleware to use 301/308 permanent redirect.

### 9. No Caching Strategy
All pages return `Cache-Control: private, no-cache, no-store`. Zero edge caching. Every request hits origin.

**Action:** Implement ISR or set `s-maxage` for Vercel edge caching on destination pages.

### 10. Missing Author Credentials
Blog authors (Emma Thompson, Sarah Chen, James Wilson) have no verifiable credentials, LinkedIn profiles, or author pages. No Person schema.

**Action:** Create author pages with verifiable credentials. Add Person schema with sameAs to external profiles.

### 11. No IndexNow Protocol
Zero Bing Copilot optimization. No IndexNow, no Bing Webmaster Tools verification, no msvalidate.01 meta tag.

**Action:** Implement IndexNow with API key. Register in Bing Webmaster Tools.

---

## Medium Priority Issues

### 12. HTML lang Attribute Incorrect
All pages use `lang="en"` regardless of locale. Should be `lang="en-AU"` for en-au, `lang="ms-MY"` for Malaysian, `lang="id-ID"` for Indonesian.

### 13. Product Schema Inaccuracies
- `lowPrice: "19.99"` but plans start from $4.99
- `priceCurrency` hardcoded as AUD regardless of locale
- Missing required `image` property (blocks rich results)

### 14. Organization sameAs Too Limited
Only 3 social profiles (Twitter, Facebook, Instagram). Missing LinkedIn, YouTube, Crunchbase, Wikipedia, Wikidata -- the platforms AI models weight most for entity resolution.

### 15. FAQ Content Accessibility
FAQ sections use `<details>/<summary>` elements. AI crawlers may not expand these, hiding valuable Q&A content. No FAQPage schema markup despite FAQ content on every destination page.

### 16. Destination FAQ Content Templated
All destination pages use the same 5 FAQ questions with only the country name swapped. No destination-specific unique questions.

### 17. No Visible "Last Updated" Dates
Destination and product pages have no freshness indicators. AI systems cannot determine content currency.

### 18. Japan Page Meta Description Too Short
Only 69 characters. Should be 150-160 characters including price, delivery method, and CTA.

### 19. Homepage Title Redundant
"Trvel - Travel eSIM Plans | Unlimited Data Worldwide | Trvel" -- "Trvel" appears twice. 61 characters (slightly over 60 target).

### 20. No About Us Page
The About page appears to redirect to or duplicate the homepage. No dedicated company story, team bios, founding narrative, or credentials.

---

## Low Priority Issues

### 21. Hreflang Mismatch Between HTML and HTTP Headers
HTTP Link headers include en-ca and en-nz locales not present in HTML hreflang tags.

### 22. No Preconnect for S3 Image Host
Missing `<link rel="preconnect" href="https://trvel-s3.s3.ap-southeast-2.amazonaws.com">`.

### 23. No font-display Property Detected
Risk of Flash of Invisible Text on slow connections.

### 24. Comparison URL Paths Verbose
`/en-au/compare/telstra-vs-esim-france` is long. Minor issue.

---

## Category Deep Dives

### AI Citability (52/100)

**Best citation-ready passages:**
- Telstra comparison table (72/100): Direct price comparison with specific numbers
- Japan speed FAQ (68/100): "Typical speeds: 20-100 Mbps" with use cases
- 10-minute guarantee (65/100): Unique value prop with specific timeframe

**Weakest areas:**
- Blog content (32/100): Thin, no original data, no citations
- Hero/marketing copy (25/100): Brand messaging, not quotable facts
- Testimonials (20/100): Self-hosted, AI models rarely cite testimonials

**Key gap:** No original research, speed tests, or proprietary data anywhere on the site. Every claim could be found on any competitor's site.

### Brand Authority (8/100)

This is the critical bottleneck. Trvel appears on zero third-party platforms that AI models use for entity recognition and recommendation. Competitors like Airalo have hundreds of Reddit threads, YouTube reviews, and travel blog mentions. Until brand authority improves, on-site optimization has diminishing returns.

### Content E-E-A-T (52/100)

| Dimension | Score |
|---|---|
| Experience | 8/25 -- No original data, no first-hand artifacts |
| Expertise | 11/25 -- Authors exist but unverifiable |
| Authoritativeness | 10/25 -- Zero third-party validation |
| Trustworthiness | 17/25 -- Good trust signals (HTTPS, contact, guarantee, legal pages) |

Strongest dimension is Trustworthiness (refund policy, phone number, guarantee). Weakest is Experience -- no speed test screenshots, no real travel photos, no proprietary data.

### Technical GEO (72/100)

**Strengths:** Server-side rendering (90/100), clean URL structure (90/100), proper meta tags (85/100), mobile optimization (85/100).

**Weaknesses:** No security headers beyond HTTPS/HSTS (35/100), no caching strategy, 307 redirect on root, sitemap missing 5 locales.

### Schema & Structured Data (28/100)

Only 3 schema blocks exist, all on the homepage only. Zero structured data on destination pages, blog posts, or how-it-works. Missing: Product per destination, FAQPage, BreadcrumbList, Article, Person, speakable. Organization sameAs has only 3 social profiles.

### Platform Optimization (47/100)

| Platform | Score |
|---|---|
| Google AI Overviews | 58/100 -- Best positioned but missing FAQPage schema |
| Google Gemini | 48/100 -- No YouTube, weak Knowledge Graph signals |
| ChatGPT Web Search | 38/100 -- No entity recognition (no Wikipedia/Wikidata) |
| Perplexity AI | 35/100 -- Zero Reddit/community validation |
| Bing Copilot | 34/100 -- Zero Microsoft ecosystem presence |

---

## Quick Wins (Implement This Week)

1. **Create llms.txt** -- Single static file, 30 minutes. Immediate AI crawler signal.
2. **Add FAQPage schema to destination pages** -- FAQ content already exists, just needs JSON-LD wrapper. 2-3 hours.
3. **Fix Product schema accuracy** -- Update lowPrice to "4.99", add image property, make currency locale-aware. 1 hour.
4. **Register on Trustpilot** -- Create business profile, begin collecting reviews. 1 hour setup.
5. **Create LinkedIn company page** -- Complete profile with description, logo, team. 1 hour.

---

## 30-Day Action Plan

### Week 1: Foundation Fixes
- [ ] Create and deploy llms.txt file
- [ ] Add FAQPage + Product + BreadcrumbList schema to destination pages
- [ ] Fix Product schema accuracy on homepage (prices, image, locale-aware currency)
- [ ] Register Trustpilot business profile
- [ ] Create LinkedIn company page
- [ ] Fix sitemap to include all 6 locale variants
- [ ] Add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

### Week 2: Content & Authority
- [ ] Expand Japan eSIM guide from 450 to 2,000+ words with original speed test data
- [ ] Add Article + Person schema to all blog posts
- [ ] Create dedicated About Us page with team bios and company story
- [ ] Begin Reddit engagement in r/travel, r/esim, r/japantravel (authentic, helpful responses)
- [ ] Implement IndexNow protocol for Bing
- [ ] Fix HTML lang attribute per locale

### Week 3: Platform Optimization
- [ ] Create Wikidata entity for Trvel
- [ ] Expand Organization sameAs with LinkedIn, YouTube, Trustpilot URLs
- [ ] Add visible "Last Updated" dates to destination and pricing pages
- [ ] Fix homepage redirect from 307 to 301
- [ ] Implement caching strategy (ISR or s-maxage)
- [ ] Differentiate FAQ content per destination (add 2-3 unique questions each)

### Week 4: Content Scale & Outreach
- [ ] Publish 4 new blog posts with original data (speed tests, price comparisons, coverage maps)
- [ ] Contact 5+ travel bloggers for "Best eSIM" roundup inclusion
- [ ] Create verifiable author profiles with LinkedIn links
- [ ] Add speakable property to destination Product schemas
- [ ] Register and verify in Bing Webmaster Tools
- [ ] Audit and consolidate overlapping blog posts

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| https://www.trvel.co | Trvel - Travel eSIM Plans | 8 (schema accuracy, title redundancy, 307 redirect, no caching, security headers) |
| https://www.trvel.co/en-au/japan | Japan eSIM | 6 (zero schema, thin meta description, templated FAQ, no last-updated) |
| https://www.trvel.co/en-au/how-it-works | How It Works | 4 (zero schema, no FAQ markup, no BreadcrumbList) |
| https://www.trvel.co/en-au/blog | Blog | 3 (no Article schema, batch-published content, 4-month gap) |
| https://www.trvel.co/en-au/reviews | Reviews | 3 (self-hosted only, no third-party integration, unverifiable claims) |
| https://www.trvel.co/en-au/blog/* | Blog posts | 5 (thin content, no citations, no author credentials, no Article schema) |

---

*Generated by GEO Audit System | April 11, 2026*
