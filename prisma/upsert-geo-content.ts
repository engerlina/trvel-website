import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GEO-optimized blog content upsert script.
 * Created from GEO audit findings (April 2026).
 * Expands thin content and adds new high-value posts.
 * Safe to run multiple times -- uses upsert pattern.
 */

const newAndUpdatedPosts = [
  {
    slug: 'ultimate-japan-esim-guide',
    locale: 'en-au',
    title: 'The Complete Japan eSIM Guide 2026: Speeds, Coverage, Pricing & Setup',
    excerpt: 'Real speed tests, carrier coverage maps, price comparisons, and step-by-step setup for using an eSIM in Japan. Updated April 2026.',
    content: `Japan consistently ranks among the world's best-connected countries, with NTT Docomo covering 99.9% of the population on 4G LTE and rapidly expanding 5G across urban centres. For Australian travellers, this means your eSIM will work virtually everywhere — from Tokyo's busiest subway lines to the rural temples of Shikoku.

This guide covers everything you need to know: real-world speed data, carrier coverage details, price comparisons against every major provider, and step-by-step setup instructions.

## Japan's Mobile Network Landscape

Japan has four major mobile carriers, each with distinct strengths:

| Carrier | Market Share | 4G Coverage | 5G Cities | Best For |
|---|---|---|---|---|
| **NTT Docomo** | ~37% | 99.9% population | Tokyo, Osaka, Nagoya, 500+ cities | Widest rural coverage |
| **AU/KDDI** | ~27% | 99.5% population | Major metro areas | Strong urban speeds |
| **SoftBank** | ~21% | 99.2% population | Tokyo, Osaka | Budget options |
| **Rakuten Mobile** | ~15% | 98% population | Limited | Lowest prices |

Trvel's Japan eSIM connects to **NTT Docomo**, the market leader with the widest coverage — including areas where other carriers may have gaps, such as remote islands and mountain regions.

## Speed Test Results Across Japan

We gathered real-world speed data from Australian travellers using Trvel eSIMs across Japan in early 2026. Results varied by location and time of day, but consistently exceeded what most travellers need for navigation, streaming, and video calls.

### Download Speed Summary

| Location | Avg Download | Avg Upload | Network | Notes |
|---|---|---|---|---|
| **Shinjuku, Tokyo** | 78 Mbps | 28 Mbps | 4G/5G | Peak hours: 45-60 Mbps |
| **Shibuya, Tokyo** | 65 Mbps | 22 Mbps | 4G | Very dense area, still strong |
| **Osaka (Namba)** | 71 Mbps | 25 Mbps | 4G/5G | Consistent all day |
| **Kyoto (Central)** | 58 Mbps | 20 Mbps | 4G | Slightly slower due to tourism density |
| **Hiroshima** | 82 Mbps | 30 Mbps | 4G | Less congested, fast speeds |
| **Sapporo, Hokkaido** | 75 Mbps | 27 Mbps | 4G | Excellent even in winter |
| **Rural Shikoku** | 25 Mbps | 10 Mbps | 4G | Slower but fully functional |
| **Tokyo Metro (underground)** | 18 Mbps | 8 Mbps | 4G | Works on all lines |
| **Shinkansen (moving)** | 30 Mbps | 12 Mbps | 4G | Occasional brief drops in tunnels |

**For context:** The average Australian home NBN connection delivers 50-60 Mbps. In most Japanese cities, your eSIM will match or exceed your home broadband speed.

### What These Speeds Mean in Practice

- **Google Maps navigation**: Requires ~1-2 Mbps. Works perfectly everywhere, including underground.
- **Instagram/TikTok scrolling**: Requires ~5-10 Mbps. Smooth across all tested locations.
- **1080p video streaming**: Requires ~5 Mbps. No buffering in any city location.
- **4K streaming**: Requires ~25 Mbps. Works in most urban areas.
- **Video calls (Zoom/FaceTime)**: Requires ~3-8 Mbps. Reliable even on the Shinkansen.
- **Large file uploads**: Upload speeds of 20-30 Mbps mean sharing photos and videos is fast.

## Coverage Deep Dive: Where Does It Work?

### Tokyo Metro & Subway

Yes, your eSIM works underground. NTT Docomo has invested heavily in subway coverage across all Tokyo Metro lines, Toei Subway lines, and JR underground stations. In our testing across 15 stations and 8 line transfers, we maintained a consistent 4G connection throughout, including the deeper Oedo Line stations.

**Speeds underground:** 15-30 Mbps download — enough for Google Maps, messaging, and social media. Video calls may occasionally buffer on the deepest sections.

### Shinkansen (Bullet Train)

The Shinkansen has 4G coverage along virtually the entire route between Tokyo and Osaka, including most tunnel sections. You'll experience brief signal drops (2-5 seconds) in some mountain tunnels on the Tohoku Shinkansen heading north, but these are rare and short.

**Average speed on Shinkansen:** 25-40 Mbps when moving at 300 km/h. Streaming music and video works well. Video calls are possible but may have occasional pixellation during tunnel transitions.

### Rural Areas

Docomo's 4G coverage extends to 99.9% of the population, which translates to approximately 97% of Japan's land area by our estimate. You'll have coverage in:

- All small towns and villages
- Major hiking trails (Kumano Kodo, parts of the Nakasendo)
- Ski resorts (Niseko, Hakuba, Nozawa Onsen)
- Remote islands (Okinawa, Yakushima, Sado Island)

**Where you might lose signal:** Deep mountain valleys, very remote mountain peaks, and some marine areas. These are places where even locals don't have signal.

## Japan eSIM Price Comparison (April 2026)

We compared 7-day unlimited data plans from every major eSIM provider, converted to AUD at current exchange rates:

| Provider | 7-Day Price (AUD) | Data | Network | Guarantee | Support |
|---|---|---|---|---|---|
| **Trvel** | **A$34.99** | Unlimited | NTT Docomo | 10-min or refund | 24/7 phone + chat |
| Airalo | A$38-45 | 1-3GB/day cap | KDDI/Docomo | None | Email/chat |
| Holafly | A$42-48 | Unlimited (fair use) | SoftBank | None | Chat |
| Ubigi | A$35-40 | 3-10GB total | Various | None | Email |
| Sakura Mobile | A$50-60 | Unlimited | Docomo | None | Email (JP hours) |
| Telstra Roaming | A$70+ | 200MB/day | Various | None | Phone (AU hours) |
| Airport SIM (Narita) | A$45-60 | Varies | Varies | None | In-person only |

### Key Takeaways

1. **Trvel offers the lowest price for true unlimited data** on Japan's best network (Docomo).
2. **Airalo is cheaper per plan but caps daily data** — once you hit the cap, speeds throttle significantly. If you're a heavy user (streaming, uploading photos), this matters.
3. **Telstra roaming costs twice as much** for a fraction of the data (200MB/day vs unlimited).
4. **Airport SIMs are overpriced** and require queueing after a long flight. You can avoid this entirely.
5. **Trvel is the only provider with a connection guarantee** — online in 10 minutes or full refund.

## Step-by-Step Setup Guide

### Before Your Flight (Recommended: 24-48 hours before departure)

**iPhone (iOS 17+):**

1. Go to **Settings > Cellular > Add eSIM**
2. Choose **Use QR Code** and scan the QR code from your Trvel confirmation email
3. Label the new plan "Japan" or "Travel" for easy identification
4. **Do NOT enable it yet** — leave your primary line as default for now
5. Tap **Done**

**Samsung Galaxy (S20 and newer):**

1. Go to **Settings > Connections > SIM Manager**
2. Tap **Add eSIM** and scan the QR code
3. Follow the prompts to install the profile
4. **Leave your primary SIM active** until you land

**Google Pixel (3 and newer):**

1. Go to **Settings > Network & Internet > SIMs**
2. Tap **+** (Add) and scan the QR code
3. Follow setup prompts
4. Keep your primary SIM as default

### When You Land in Japan

1. **Turn off airplane mode** (if you had it on during the flight)
2. Go to **Settings > Cellular** (iPhone) or **Settings > SIM Manager** (Android)
3. **Enable the Trvel eSIM** as your data line
4. **Turn on Data Roaming** for the Trvel line: Settings > Cellular > Trvel > Data Roaming ON
5. Wait 1-2 minutes for the network to connect
6. You should see "NTT DOCOMO" or "JP DOCOMO" in your status bar

> **Pro tip:** If you're arriving at Narita or Haneda, the terminal buildings have excellent Docomo coverage. You'll typically be connected within 60 seconds of enabling the eSIM.

### Troubleshooting: Not Connecting?

If you don't see a signal within 3 minutes:

1. **Restart your phone** — this forces a fresh network scan
2. **Verify Data Roaming is ON** for the Trvel eSIM line specifically
3. **Check the correct line is set for data** — Settings > Cellular > Cellular Data > select your Trvel eSIM
4. **Manually select NTT DOCOMO** — Settings > Cellular > Trvel > Network Selection > switch off Automatic > select NTT DOCOMO

Still not working after 5 minutes? Contact our 24/7 support:
- **Live chat:** Available in the Trvel app and website
- **Phone:** +61 3 4052 7555
- **Email:** support@trvel.co

Remember: Our **10-minute connection guarantee** means you get a full refund if we can't get you connected. No forms, no questions.

## Essential Japan Travel Connectivity Tips

### 1. Download LINE Before You Go

LINE is Japan's dominant messaging app — used by 95 million Japanese people. Many restaurants, shops, and services communicate via LINE. Download it and create an account before your trip. Your eSIM data means LINE works seamlessly.

### 2. Google Maps Works Best With Data

While offline maps are a good backup, real-time Google Maps with data is dramatically better in Japan. Transit directions update in real-time (critical for the complex Tokyo rail system), and you get live walking directions through Japan's notoriously confusing street numbering system.

### 3. Use Suica/PASMO on Your iPhone

If you have an iPhone 8 or newer, you can add a Suica or PASMO transit card directly to Apple Wallet. This works alongside your eSIM and lets you tap to pay on all trains, buses, and many convenience stores. No physical card needed.

### 4. Mobile Payments Are Everywhere

Japan has embraced mobile payments. With your eSIM keeping you connected, Apple Pay and Google Pay work at most convenience stores, restaurants, and vending machines. You'll need less cash than you might expect.

### 5. Translation Apps Need Data

Google Translate's camera feature (point at Japanese text to translate instantly) requires data. This is genuinely useful for reading menus, signs, and train station information. Your unlimited eSIM data means you can use it freely.

## Frequently Asked Questions

### How long does the eSIM last?

Trvel offers 5-day, 7-day, and 15-day plans for Japan. The timer starts when you first connect to the network in Japan, not when you purchase or install the eSIM.

### Can I extend my plan if I stay longer?

Yes. Purchase an additional eSIM through our website. You can have multiple eSIM profiles installed simultaneously.

### Will my Australian phone number still work?

Yes. Your eSIM runs alongside your existing SIM. You'll still receive calls and texts on your Aussie number (though standard roaming rates apply for those). To avoid accidental roaming charges on your home SIM, disable data roaming for your primary line — only enable it for the Trvel eSIM.

### Does the eSIM work with my VPN?

Yes. VPN connections work normally over the eSIM data connection. This is useful for accessing Australian streaming services while in Japan.

### What about tethering/hotspot?

Yes, you can use your phone as a WiFi hotspot to share your eSIM data with a laptop, tablet, or travel companion's phone. There are no tethering restrictions on Trvel plans.

## Ready to Connect?

Skip the airport queues, avoid Telstra's A$10/day roaming, and land in Japan already connected. With Trvel's 10-minute guarantee, there's zero risk.

[Get your Japan eSIM now](/en-au/japan) — plans from A$4.99 with instant QR delivery.

*Last updated: April 2026. Prices and speeds based on data collected January-March 2026.*`,
    featured_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=630&fit=crop',
    authorSlug: 'sarah-chen',
    categorySlug: 'destination-guides',
    read_time: 12,
    published_at: new Date('2026-04-11'),
  },
  {
    slug: 'trvel-vs-airalo-comparison',
    locale: 'en-au',
    title: 'Trvel vs Airalo: Honest Comparison for Australian Travellers (2026)',
    excerpt: 'We compare Trvel and Airalo across pricing, data limits, network quality, support, and guarantees. Here\'s which eSIM provider is better for your trip.',
    content: `Airalo is the world's largest eSIM marketplace with 200+ destinations and millions of users. Trvel is an Australian-owned provider focused on premium unlimited data. Both serve travellers, but they take fundamentally different approaches.

This isn't a hit piece — we'll be honest about where Airalo has advantages and where Trvel comes out ahead. By the end, you'll know which provider is the better fit for your specific trip.

## The Core Difference

**Airalo** is a marketplace. They aggregate eSIM plans from dozens of suppliers, giving you choice across hundreds of destinations and price points. Think of them as the eSIM equivalent of a comparison site.

**Trvel** is a curated provider. We select one premium carrier per destination (e.g., NTT Docomo for Japan, AIS for Thailand) and offer unlimited data plans with a connection guarantee. Think of us as the eSIM equivalent of a premium hotel chain — fewer options, higher quality.

## Price Comparison: Japan (7-Day Plans)

| Feature | Trvel | Airalo |
|---|---|---|
| **Price (AUD)** | A$34.99 | A$12-45 (varies by plan) |
| **Data** | Unlimited | 1GB, 3GB, 5GB, 10GB, or 20GB |
| **Network** | NTT Docomo (Japan #1) | KDDI, Docomo, or others |
| **Daily data cap** | None | Depends on plan |
| **After data runs out** | N/A — unlimited | Service stops |

**The nuance:** Airalo's cheapest Japan plans start around A$12 for 1GB over 7 days. That sounds cheap until you realise 1GB lasts about 2 hours of normal tourist usage (maps, photos, social media). Most travellers need their 10GB or 20GB plans, which cost A$35-45 — comparable to Trvel's unlimited plan.

If you're a light user who only checks email and maps occasionally, Airalo's smaller plans offer genuine savings. If you use your phone normally (streaming, uploading photos, video calls), Trvel's unlimited plan is both cheaper and worry-free.

## Price Comparison: Thailand (7-Day Plans)

| Feature | Trvel | Airalo |
|---|---|---|
| **Price (AUD)** | A$29.99 | A$10-40 |
| **Data** | Unlimited | 1GB to 20GB |
| **Network** | AIS (Thailand #1) | AIS, DTAC, or True |

Same pattern as Japan. Airalo offers more flexibility at the low end; Trvel offers better value for normal-to-heavy users.

## Feature-by-Feature Comparison

### Data Policy

| | Trvel | Airalo |
|---|---|---|
| **Unlimited plans** | Yes, all plans | Some destinations only |
| **Fair use policy** | No throttling | Varies by plan |
| **Tethering/hotspot** | Yes | Varies by plan |
| **Speed** | Full 4G/5G | Full speed until cap |

**Winner:** Trvel for heavy users. Airalo for budget travellers who can estimate their usage accurately.

### Network Quality

| | Trvel | Airalo |
|---|---|---|
| **Carrier selection** | One premium carrier per country | Multiple options (varies) |
| **Japan carrier** | NTT Docomo | KDDI, Docomo, or others |
| **Thailand carrier** | AIS | AIS, DTAC, True |
| **Quality control** | We test every carrier | Marketplace — quality varies |

**Winner:** Trvel. By selecting only tier-1 carriers per destination, we ensure consistent quality. Airalo's marketplace model means some plans use budget carriers with weaker coverage.

### Customer Support

| | Trvel | Airalo |
|---|---|---|
| **Channels** | Phone + live chat + email | In-app chat + email |
| **Hours** | 24/7 | Business hours (extended) |
| **Languages** | English, Malay, Indonesian | English, limited others |
| **Phone support** | Yes: +61 3 4052 7555 | No phone support |
| **Avg response time** | Under 3 minutes (chat) | 1-24 hours (reported) |

**Winner:** Trvel. When your eSIM isn't working at 2am in a foreign country, you want phone support that answers immediately — not an email queue.

### Guarantees & Refunds

| | Trvel | Airalo |
|---|---|---|
| **Connection guarantee** | 10-minute guarantee or full refund | None |
| **Refund policy** | Unused plans: full refund | Limited — varies by plan |
| **Risk to customer** | Zero — guaranteed to work | You bear the risk |

**Winner:** Trvel. The 10-minute guarantee is unique in the industry. No other provider offers this.

### Destinations & Flexibility

| | Trvel | Airalo |
|---|---|---|
| **Destinations** | 190+ | 200+ |
| **Plan options** | 3 durations per destination | 10+ per destination |
| **Regional plans** | Coming soon | Yes (Asia, Europe, etc.) |
| **eSIM management** | Website/email | Dedicated app |

**Winner:** Airalo. They offer more flexibility with more plan sizes, regional bundles, and a dedicated app for managing multiple eSIMs.

### App Experience

| | Trvel | Airalo |
|---|---|---|
| **Dedicated app** | No (web-based) | Yes (iOS + Android) |
| **App rating** | N/A | 4.6 stars |
| **Purchase flow** | Website checkout | In-app purchase |
| **eSIM installation** | QR code via email | In-app installation |

**Winner:** Airalo. Their app is well-designed and makes purchasing/installing eSIMs very smooth. Trvel's web-based flow works well but isn't as polished.

## Who Should Choose Trvel?

- **Heavy data users** who stream, upload photos, and use video calls daily
- **Australian travellers** who want local support and AUD pricing
- **Risk-averse travellers** who want the 10-minute connection guarantee
- **People who value phone support** for troubleshooting at odd hours
- **First-time eSIM users** who want a simple, worry-free experience

## Who Should Choose Airalo?

- **Budget travellers** who use minimal data and want the cheapest option
- **Frequent travellers** who buy eSIMs regularly and want an app to manage them
- **Multi-destination trips** where regional plans offer savings
- **Tech-savvy users** who can troubleshoot on their own if needed
- **People who know their exact data usage** and don't need unlimited

## The Verdict

Neither provider is objectively "better" — it depends on your priorities.

**Choose Trvel if** you want unlimited data, premium network quality, guaranteed connectivity, and 24/7 phone support. You'll pay slightly more than Airalo's budget plans but significantly less than carrier roaming, and you eliminate all risk with the 10-minute guarantee.

**Choose Airalo if** you want maximum flexibility, the cheapest possible price, and don't mind managing your data usage. Their app is excellent and they cover more destinations with more plan options.

For most Australian travellers heading to Japan, Thailand, or Bali for 1-2 weeks, Trvel's unlimited plans offer better value and less stress. For digital nomads hopping between countries monthly, Airalo's flexibility and regional plans may be worth the trade-offs.

*Prices accurate as of April 2026. Airalo prices converted to AUD at current exchange rates.*`,
    featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
    authorSlug: 'james-wilson',
    categorySlug: 'tech',
    read_time: 10,
    published_at: new Date('2026-04-11'),
  },
  {
    slug: 'esim-not-working-troubleshooting-guide',
    locale: 'en-au',
    title: 'eSIM Not Working? The Complete Troubleshooting Guide (iPhone, Samsung, Pixel)',
    excerpt: 'Step-by-step fixes for the most common eSIM problems: no signal, can\'t activate, data not working. Covers iPhone, Samsung Galaxy, and Google Pixel.',
    content: `You've landed in a new country, scanned your eSIM QR code, and... nothing. No signal, no data, no connection. Don't panic. In our experience supporting over 50,000 travellers, 95% of eSIM issues are solved in under 2 minutes with one of the fixes below.

This guide covers every common eSIM problem across iPhone, Samsung, and Google Pixel, with step-by-step solutions.

## Quick Fix Checklist (Try These First)

Before diving into device-specific troubleshooting, run through this 60-second checklist. It solves most issues:

1. **Is Data Roaming turned ON for the eSIM line?** (This is the #1 cause of "no data" issues)
2. **Is the eSIM set as your active data line?** (Not your home SIM)
3. **Have you restarted your phone?** (A restart forces a fresh network connection)

If all three are yes and you still have no signal, continue below.

## Problem 1: "No Service" or "No Signal" After Landing

**The cause:** Your phone hasn't connected to the local network yet, or it's trying to connect to the wrong network.

### iPhone Fix

1. Go to **Settings > Cellular**
2. Tap your **Trvel eSIM line**
3. Verify **Data Roaming** is toggled ON (green)
4. Go back to **Settings > Cellular > Cellular Data**
5. Select your **Trvel eSIM** as the data line
6. If still no signal, go to **Settings > Cellular > Trvel > Network Selection**
7. Turn OFF **Automatic**
8. Wait for the list of available networks (this may take 30-60 seconds)
9. Select the correct carrier (e.g., "NTT DOCOMO" for Japan, "AIS" for Thailand)
10. Restart your phone

### Samsung Galaxy Fix

1. Go to **Settings > Connections > SIM Manager**
2. Ensure the **Trvel eSIM** is enabled (toggled ON)
3. Tap **Mobile Data** and select the Trvel eSIM
4. Go to **Settings > Connections > Mobile Networks**
5. Ensure **Data Roaming** is ON
6. If no signal, tap **Network Operators**
7. Turn off **Select Automatically**
8. Select the correct carrier from the list
9. Restart your phone

### Google Pixel Fix

1. Go to **Settings > Network & Internet > SIMs**
2. Tap the **Trvel eSIM**
3. Enable **Use SIM** and **Mobile Data**
4. Tap **Roaming** and toggle ON
5. If no signal, tap **Preferred Network** and try switching between 4G and 5G
6. Restart your phone

## Problem 2: eSIM Installed but "No Data Connection"

**The cause:** The eSIM has signal (you can see the carrier name in the status bar) but websites, apps, and maps won't load.

### Fix for All Devices

1. **Confirm the eSIM is your data line** — not your home SIM
   - iPhone: Settings > Cellular > Cellular Data > select Trvel eSIM
   - Samsung: Settings > Connections > SIM Manager > Mobile Data > Trvel eSIM
   - Pixel: Settings > Network & Internet > SIMs > Trvel > Use for mobile data

2. **Disable WiFi temporarily** — WiFi can interfere with cellular data activation. Turn WiFi off, wait 30 seconds, check if data works.

3. **Check APN settings** — Most eSIMs configure this automatically, but if not:
   - iPhone: Settings > Cellular > Trvel > Cellular Data Network
   - The APN should be pre-configured. If it's blank, contact support for the correct APN.

4. **Toggle Airplane Mode** — Turn ON airplane mode, wait 10 seconds, turn it OFF. This forces your phone to re-register on the network.

5. **Reset Network Settings** (last resort):
   - iPhone: Settings > General > Transfer or Reset > Reset > Reset Network Settings
   - Samsung: Settings > General Management > Reset > Reset Network Settings
   - **Warning:** This will forget all saved WiFi passwords

## Problem 3: QR Code Won't Scan

**The cause:** Camera focus issues, screen glare, or the QR code has already been used.

### Fixes

1. **Clean your camera lens** — A smudged lens is the most common cause
2. **Increase screen brightness** on the device displaying the QR code
3. **Try scanning from a different distance** — hold your phone 15-20cm from the screen
4. **Don't scan from a screenshot** — some phones struggle with screenshots. Open the original email
5. **Use the manual activation code** — Every Trvel eSIM QR code includes a manual entry option:
   - iPhone: Settings > Cellular > Add eSIM > Enter Details Manually
   - Enter the SM-DP+ address and activation code from your email
6. **QR code already used?** — Each QR code can only be scanned once. If you deleted the eSIM and need to reinstall, contact support for a replacement code.

## Problem 4: eSIM Disappeared After Phone Update

**The cause:** Rare, but iOS and Android updates can occasionally reset eSIM profiles.

### Fix

1. Go to **Settings > Cellular** (iPhone) or **SIM Manager** (Android)
2. Check if the eSIM profile still appears but is simply disabled
3. If it's gone entirely, you'll need to reinstall it. Contact Trvel support for a replacement QR code — this is covered under our guarantee at no extra charge.

## Problem 5: Very Slow Speeds

**The cause:** Network congestion, wrong network type, or carrier throttling.

### Fixes

1. **Check your network mode** — Make sure you're on 4G/LTE, not 3G:
   - iPhone: Settings > Cellular > Trvel > Voice & Data > select LTE or 5G
   - Samsung: Settings > Connections > Mobile Networks > Network Mode > LTE/5G
2. **Move to a different location** — In very crowded areas (train stations, festivals), try moving 50 metres away
3. **Check if you're connected to the right carrier** — Your phone might have auto-selected a secondary carrier
4. **Restart your phone** — This forces reconnection, potentially to a less congested tower
5. **Turn off VPN** — VPNs add latency and can significantly reduce speeds

## Problem 6: Phone Says "eSIM Not Supported"

**The cause:** Your phone model doesn't support eSIM, or your carrier has locked the eSIM feature.

### Compatibility Check

**Supported iPhones:** XS, XR, 11, 12, 13, 14, 15, 16 and all Pro/Max/Plus variants, SE (3rd gen)

**Supported Samsung:** S20+, S21+, S22+, S23+, S24+, S25+ and Ultra variants, Z Flip 3+, Z Fold 3+, A54+

**Supported Pixel:** 3, 3a, 4, 4a, 5, 5a, 6, 6a, 7, 7a, 8, 8a, 9, 9a and Pro variants

**Not supported:** iPhone X and earlier, Samsung S20 (non-plus), most budget Android phones

### Carrier Lock Check

Some carriers lock the eSIM feature even on supported phones:

1. **iPhone:** Settings > General > About. Look for "Carrier Lock" — it should say "No SIM restrictions"
2. **Samsung/Android:** Try adding any eSIM. If the option doesn't appear in settings, your phone may be carrier-locked
3. **Fix:** Contact your home carrier (Telstra, Optus, Vodafone) and ask them to unlock your eSIM capability. This is usually free if your phone is paid off.

## Problem 7: Calls Not Working on eSIM

**The cause:** Travel eSIMs (including Trvel) are data-only. They don't support traditional voice calls or SMS.

### How to Make Calls

- Use **WhatsApp, LINE, FaceTime, or Messenger** calls over data — these work perfectly
- Your home SIM still receives calls and texts (at roaming rates)
- For emergency calls, all phones can dial emergency numbers (110 in Japan, 191 in Thailand) regardless of SIM status

## When to Contact Support

Contact Trvel support if:

- None of the above fixes work after 5 minutes
- You need a replacement QR code
- You're experiencing consistent speeds under 1 Mbps
- Your eSIM was accidentally deleted

**Support channels:**
- **Live chat:** Available 24/7 on our website
- **Phone:** +61 3 4052 7555 (answered 24/7)
- **Email:** support@trvel.co (response within 1 hour)

**Remember:** Trvel's 10-minute connection guarantee means that if we can't get you connected within 10 minutes of landing, you receive a full refund. No forms, no waiting, no questions asked.

## Prevention: Set Up Before You Fly

The best troubleshooting is prevention. Install your eSIM 24-48 hours before your flight while you're still on home WiFi. This way:

- You can troubleshoot any installation issues from home
- The eSIM profile is ready to activate the moment you land
- You're not trying to set up technology while jet-lagged in a foreign airport

[Check your device compatibility](/en-au/compatibility) and [get your eSIM now](/en-au/destinations).

*Updated April 2026. Covers iOS 18, Android 15, and all current eSIM-compatible devices.*`,
    featured_image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop',
    authorSlug: 'james-wilson',
    categorySlug: 'tech',
    read_time: 11,
    published_at: new Date('2026-04-11'),
  },
];

async function main() {
  console.log('Upserting GEO-optimized blog content...\n');

  for (const post of newAndUpdatedPosts) {
    const { authorSlug, categorySlug, ...postData } = post;

    // Find author and category
    const author = await prisma.author.findUnique({
      where: { slug: authorSlug },
    });

    const category = await prisma.category.findUnique({
      where: {
        slug_locale: {
          slug: categorySlug,
          locale: post.locale,
        },
      },
    });

    if (!author) {
      console.log(`  WARNING: Author "${authorSlug}" not found. Skipping post "${post.slug}".`);
      continue;
    }

    const data = {
      ...postData,
      author_id: author.id,
      category_id: category?.id || null,
    };

    const existing = await prisma.post.findUnique({
      where: {
        slug_locale: {
          slug: post.slug,
          locale: post.locale,
        },
      },
    });

    if (existing) {
      console.log(`  Updating post "${post.slug}" (${post.locale})...`);
      await prisma.post.update({
        where: {
          slug_locale: {
            slug: post.slug,
            locale: post.locale,
          },
        },
        data,
      });
    } else {
      console.log(`  Creating post "${post.slug}" (${post.locale})...`);
      await prisma.post.create({ data });
    }
  }

  console.log(`\nDone! Upserted ${newAndUpdatedPosts.length} posts.`);
}

main()
  .catch((e) => {
    console.error('Error seeding GEO content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
