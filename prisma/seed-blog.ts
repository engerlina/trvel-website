import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authors = [
  {
    slug: 'sarah-chen',
    name: 'Sarah Chen',
    bio: 'Travel writer and Asia specialist with over 10 years of experience exploring destinations across Japan, Korea, and Southeast Asia.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    slug: 'james-wilson',
    name: 'James Wilson',
    bio: 'Tech journalist and digital nomad who has tested mobile connectivity solutions across 50+ countries.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  },
  {
    slug: 'emma-thompson',
    name: 'Emma Thompson',
    bio: 'Former travel agent turned content creator, helping Australians make the most of their overseas adventures.',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
];

const categories = [
  {
    slug: 'destination-guides',
    locale: 'en-au',
    name: 'Destination Guides',
    description: 'In-depth guides for popular travel destinations with local tips and insights.',
  },
  {
    slug: 'tech',
    locale: 'en-au',
    name: 'Tech & Connectivity',
    description: 'Everything about eSIMs, mobile data, and staying connected while travelling.',
  },
  {
    slug: 'travel-tips',
    locale: 'en-au',
    name: 'Travel Tips',
    description: 'Practical advice and hacks to make your travels smoother and more enjoyable.',
  },
];

const blogPosts = [
  {
    slug: 'ultimate-japan-esim-guide',
    locale: 'en-au',
    title: 'The Ultimate Japan eSIM Guide: Everything You Need to Know Before Your Trip',
    excerpt: 'Planning a trip to Japan? Here\'s your complete guide to staying connected with an eSIM, from setup to activation and beyond.',
    content: `Japan is a dream destination for millions of travellers, but staying connected can be tricky if you're not prepared. In this comprehensive guide, we'll cover everything you need to know about using an eSIM in Japan.

## Why Choose an eSIM for Japan?

Traditional SIM cards require you to either wait in long airport queues or hunt down a convenience store that sells them. With an eSIM, you can be connected the moment you land at Narita or Haneda.

### The Benefits

- **Instant activation** - Set up before you even board your flight
- **No physical SIM swap** - Keep your home number active
- **Premium networks** - Connect to NTT Docomo, Japan's #1 carrier
- **Unlimited data** - Stream, navigate, and share without worry

## Setting Up Your eSIM

The process is surprisingly simple:

1. Purchase your eSIM online and receive the QR code via email
2. Go to Settings > Cellular > Add eSIM on your iPhone (or equivalent on Android)
3. Scan the QR code
4. Enable data roaming when you land

> Pro tip: Set up your eSIM at home before departure. This way, you'll be connected the second your plane touches down.

## Coverage Across Japan

Whether you're exploring the neon streets of Tokyo, the ancient temples of Kyoto, or the ski slopes of Niseko, you'll have reliable coverage. Japan has one of the best mobile networks in the world, and with Trvel, you're connected to tier-1 carriers.

## Final Tips

Don't forget to download offline maps of the areas you'll visit, just in case. And remember, Japan's trains have excellent Wi-Fi too, so you'll rarely be without connection.

Ready to get connected? [Get your Japan eSIM now](/en-au) and travel with peace of mind.`,
    featured_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=630&fit=crop',
    authorSlug: 'sarah-chen',
    categorySlug: 'destination-guides',
    read_time: 6,
    published_at: new Date('2024-12-10'),
  },
  {
    slug: 'esim-vs-physical-sim-which-is-better',
    locale: 'en-au',
    title: 'eSIM vs Physical SIM: Which Is Better for International Travel?',
    excerpt: 'Confused about whether to use an eSIM or traditional SIM card for your next trip? We break down the pros and cons of each.',
    content: `When planning international travel, one of the most common questions is: should I use an eSIM or stick with a traditional physical SIM card? Let's dive into the details.

## What Is an eSIM?

An eSIM (embedded SIM) is a digital SIM that's built into your phone. Instead of inserting a physical card, you simply scan a QR code or download a profile to activate your mobile plan.

## The Case for eSIMs

### 1. Instant Setup

No more hunting for SIM card vendors at airports or figuring out how to pop open your SIM tray. With an eSIM, you can purchase and set up your plan from anywhere in the world.

### 2. Keep Your Home Number

Since eSIMs work alongside your physical SIM, you can keep your Australian number active for calls and texts while using the eSIM for data abroad.

### 3. No Risk of Losing Tiny Cards

We've all been there—fumbling with a tiny SIM card at the airport, terrified of dropping it. eSIMs eliminate this stress entirely.

### 4. Better for the Environment

No plastic cards, no packaging, no waste. eSIMs are the greener choice.

## When Physical SIMs Still Make Sense

Physical SIMs might be preferable if:

- Your phone doesn't support eSIM (older models)
- You're travelling to very remote areas with limited carrier options
- You prefer having a backup you can physically swap between devices

## The Verdict

For most Australian travellers heading to popular destinations like Japan, Thailand, or Europe, eSIMs are the clear winner. They're more convenient, often cheaper, and you can set everything up before you leave home.

Check if your phone supports eSIM and join the millions who've already made the switch.`,
    featured_image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=630&fit=crop',
    authorSlug: 'james-wilson',
    categorySlug: 'tech',
    read_time: 5,
    published_at: new Date('2024-12-08'),
  },
  {
    slug: '5-mistakes-to-avoid-when-travelling-abroad',
    locale: 'en-au',
    title: '5 Common Mistakes Australians Make When Travelling Abroad (And How to Avoid Them)',
    excerpt: 'Don\'t let these rookie errors ruin your international trip. Here are the top mistakes to avoid and what to do instead.',
    content: `After helping over 50,000 Australian travellers stay connected abroad, we've seen patterns emerge. Here are the most common mistakes—and how to avoid them.

## 1. Relying on Carrier Roaming

We get it—Telstra's roaming seems convenient. Just turn on your phone and go, right? But at $10/day (and more for some carriers), a two-week trip can easily cost you $140+ just for data.

**The fix:** Get an eSIM before you fly. You'll save 60-80% compared to carrier roaming.

## 2. Waiting Until You Land to Sort Connectivity

Airport SIM card vendors know you're desperate. Prices are often inflated, queues are long, and you're jet-lagged. Not ideal.

**The fix:** Set up your eSIM at home, before you even pack your bags. You'll be online the moment you land.

## 3. Underestimating Data Usage

Google Maps, Instagram stories, video calls with family—data adds up fast when you're abroad. Many travellers buy small data packages and burn through them in days.

**The fix:** Choose an unlimited data plan. The peace of mind is worth it.

## 4. Not Having Offline Backups

Even with great connectivity, it's smart to have offline maps and important documents downloaded. You never know when you'll be in a subway tunnel or remote temple.

**The fix:** Download Google Maps offline areas and save key documents to your phone before departure.

## 5. Not Knowing Your Support Options

Many eSIM providers offer support, but travellers often don't know how to reach them. When something goes wrong at 2am in Tokyo, email won't cut it.

**The fix:** Save your provider's support number before you travel. Trvel offers live chat and phone support—our team typically responds within 3 minutes, even at odd hours.

## Travel Smarter

Avoiding these mistakes will save you money, stress, and precious holiday time. The key theme? Prepare before you go.`,
    featured_image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop',
    authorSlug: 'emma-thompson',
    categorySlug: 'travel-tips',
    read_time: 4,
    published_at: new Date('2024-12-05'),
  },
  {
    slug: 'best-time-to-visit-thailand',
    locale: 'en-au',
    title: 'Best Time to Visit Thailand: A Month-by-Month Weather Guide',
    excerpt: 'Planning a Thai adventure? Here\'s when to go for the best weather, fewer crowds, and unbeatable deals.',
    content: `Thailand is a year-round destination, but timing your trip right can mean the difference between paradise and soggy disappointment. Here's your complete guide.

## Understanding Thailand's Seasons

Thailand has three main seasons:

- **Hot Season (March-May):** Temperatures peak at 35-40°C
- **Rainy Season (June-October):** Monsoons bring daily downpours
- **Cool Season (November-February):** Perfect weather, peak prices

## Month-by-Month Breakdown

### November - February: Peak Season

This is Thailand at its finest. Cool breezes, low humidity, and minimal rain. It's also the busiest and most expensive time to visit. Book accommodation and flights early.

### March - May: Hot Season

If you can handle the heat, this shoulder season offers great deals. April brings Songkran, Thailand's famous water festival—an unforgettable experience.

### June - October: Green Season

Don't write off the rainy season entirely. Showers are usually brief (an hour or two in the afternoon), and you'll enjoy lower prices, lush landscapes, and fewer tourists.

> Pro tip: The Gulf islands (Koh Samui, Koh Phangan) have opposite weather patterns. Their best months are actually January-September.

## Best Times for Specific Activities

- **Diving:** October-May for best visibility
- **Temples & Culture:** November-February for comfortable sightseeing
- **Beaches:** December-February for Andaman coast, January-September for Gulf islands
- **Budget Travel:** May-October for best deals

## Stay Connected During Your Trip

Whatever time you visit, make sure you're connected. Thailand's eSIM coverage is excellent, connecting you to AIS—the country's largest mobile network.`,
    featured_image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&h=630&fit=crop',
    authorSlug: 'sarah-chen',
    categorySlug: 'destination-guides',
    read_time: 5,
    published_at: new Date('2024-12-01'),
  },
  {
    slug: 'how-to-check-if-phone-supports-esim',
    locale: 'en-au',
    title: 'How to Check If Your Phone Supports eSIM (2024 Complete Guide)',
    excerpt: 'Not sure if your phone can use an eSIM? Here\'s how to check, plus a list of all compatible devices.',
    content: `Before purchasing an eSIM for your travels, you need to confirm your phone supports it. Here's how to check on any device.

## Quick Check Methods

### iPhone

1. Go to **Settings > General > About**
2. Scroll down to find "Available SIM" or "Digital SIM"
3. If you see an IMEI number for EID, your phone supports eSIM

Alternatively: **Settings > Cellular > Add eSIM**. If this option exists, you're good to go.

### Android

1. Go to **Settings > Network & Internet > Mobile Network**
2. Look for "Add carrier" or "Download SIM" option
3. If present, your device supports eSIM

You can also dial **\\*#06#** to see your EID number—if it appears, eSIM is supported.

## Compatible iPhone Models

All iPhones from iPhone XS onwards support eSIM:

- iPhone XS, XS Max, XR
- iPhone 11 series
- iPhone 12 series
- iPhone 13 series
- iPhone 14 series
- iPhone 15 series
- iPhone SE (2nd & 3rd generation)

## Compatible Android Phones

Most flagship Android phones from 2019 onwards support eSIM:

- **Samsung:** Galaxy S20 and newer, Galaxy Z Fold/Flip series, Note 20+
- **Google:** Pixel 3a and newer
- **OnePlus:** OnePlus 12, 11
- **Xiaomi:** 13 series, 14 series
- **Oppo:** Find X3 Pro and newer

## Important: Carrier Lock

Even if your phone supports eSIM hardware, it must be **carrier unlocked** to use a travel eSIM. If you bought your phone outright or have finished paying off your plan, it should be unlocked. Contact your carrier if unsure.

## Ready to Go?

Once you've confirmed eSIM support, you're just a QR code scan away from staying connected on your next adventure.`,
    featured_image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=1200&h=630&fit=crop',
    authorSlug: 'james-wilson',
    categorySlug: 'tech',
    read_time: 4,
    published_at: new Date('2024-11-28'),
  },
  {
    slug: 'south-korea-travel-tips-first-timers',
    locale: 'en-au',
    title: 'First Time in South Korea? 10 Tips Every Australian Traveller Needs',
    excerpt: 'From K-Pop to kimchi, here\'s everything you need to know before your first trip to South Korea.',
    content: `South Korea has exploded in popularity among Australian travellers, thanks to K-drama, K-pop, and incredible food. Here's what you need to know for an amazing first visit.

## 1. Get a T-money Card

This rechargeable transit card works on all Seoul subways, buses, and even in convenience stores. Pick one up at any subway station or airport—it'll save you money and hassle.

## 2. Download Kakao Maps

Google Maps works in Korea, but Kakao Maps is far superior for local navigation. It has better public transport directions and up-to-date information.

## 3. Cash Is Still King in Some Places

While Seoul is increasingly cashless, many smaller restaurants, street food vendors, and traditional markets only accept cash. Withdraw Korean Won from ATMs at convenience stores (7-Eleven, CU, GS25).

## 4. Learn Basic Korean Phrases

A little effort goes a long way:

- **Annyeonghaseyo** (안녕하세요) - Hello
- **Kamsahamnida** (감사합니다) - Thank you
- **Eolmaeyo?** (얼마에요?) - How much?

## 5. Shoes Off Indoors

In traditional restaurants (especially those with floor seating), temples, and Korean homes, you'll need to remove your shoes. Wear socks you're comfortable showing off!

## 6. Tipping Isn't Expected

Unlike Australia, tipping isn't part of Korean culture. In fact, it can sometimes be considered rude. Just pay the listed price.

## 7. Convenience Stores Are Amazing

Korean convenience stores (편의점) are a world apart from what you're used to. Hot food, seating areas, cheap snacks, and surprisingly good meals. Don't sleep on triangle kimbap!

## 8. WiFi Is Everywhere

Korea has some of the best WiFi infrastructure in the world. That said, an eSIM gives you uninterrupted coverage when moving between spots—essential for navigation.

## 9. Visit a Jjimjilbang

Korean spas (jjimjilbang) are a cultural experience everyone should try. For about $15-20, you get access to saunas, hot pools, and rest areas—some open 24 hours.

## 10. Plan for Crowds

Popular spots like Gyeongbokgung Palace and Myeongdong get packed. Visit early morning or on weekdays if possible.

## Stay Connected

Korea runs on apps—from ordering food to catching taxis. Make sure you have reliable data from the moment you land. Our Korea eSIM connects you to SK Telecom and KT, the country's top carriers.`,
    featured_image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&h=630&fit=crop',
    authorSlug: 'emma-thompson',
    categorySlug: 'travel-tips',
    read_time: 7,
    published_at: new Date('2024-11-25'),
  },
];

async function main() {
  console.log('Seeding blog data with authors and categories...\n');

  // Clear existing posts first (to avoid FK constraint issues)
  console.log('Clearing existing posts...');
  await prisma.post.deleteMany({});

  // Seed Authors
  console.log('\nSeeding authors...');
  for (const author of authors) {
    const existing = await prisma.author.findUnique({
      where: { slug: author.slug },
    });

    if (existing) {
      console.log(`  Author "${author.name}" already exists, updating...`);
      await prisma.author.update({
        where: { slug: author.slug },
        data: author,
      });
    } else {
      console.log(`  Creating author "${author.name}"...`);
      await prisma.author.create({ data: author });
    }
  }

  // Seed Categories
  console.log('\nSeeding categories...');
  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: {
        slug_locale: {
          slug: category.slug,
          locale: category.locale,
        },
      },
    });

    if (existing) {
      console.log(`  Category "${category.name}" already exists, updating...`);
      await prisma.category.update({
        where: {
          slug_locale: {
            slug: category.slug,
            locale: category.locale,
          },
        },
        data: category,
      });
    } else {
      console.log(`  Creating category "${category.name}"...`);
      await prisma.category.create({ data: category });
    }
  }

  // Seed Posts with relations
  console.log('\nSeeding posts...');
  for (const post of blogPosts) {
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

    const existing = await prisma.post.findUnique({
      where: {
        slug_locale: {
          slug: post.slug,
          locale: post.locale,
        },
      },
    });

    const data = {
      ...postData,
      author_id: author?.id,
      category_id: category?.id,
    };

    if (existing) {
      console.log(`  Post "${post.slug}" already exists, updating...`);
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
      console.log(`  Creating post "${post.slug}"...`);
      await prisma.post.create({ data });
    }
  }

  console.log('\n✓ Done! Seeded:');
  console.log(`  - ${authors.length} authors`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${blogPosts.length} blog posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
