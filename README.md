# Trvel.co Website

A Next.js 14+ website with internationalization, database integration, authentication, and payment processing.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **i18n**: next-intl
- **Styling**: Tailwind CSS
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Hosting**: Vercel (ready for deployment)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Supabase recommended)
- Supabase project
- Stripe account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following variables:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

3. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /[locale]              → Locale-based routing
    /page.tsx           → Homepage
    /[destination]      → Destination pages
    /blog/[slug]        → Blog posts
    /checkout           → Checkout flow
/lib
  /db.ts                → Prisma client
  /stripe.ts            → Stripe utilities
  /supabase.ts          → Supabase clients
/messages               → i18n translation files
/prisma
  /schema.prisma        → Database schema
```

## Supported Locales

- `en-au` - Australia (English, AUD)
- `en-sg` - Singapore (English, SGD)
- `en-gb` - UK (English, GBP)
- `ms-my` - Malaysia (Bahasa, MYR)
- `id-id` - Indonesia (Bahasa, IDR)

## Database Schema

The project includes three main models:

- **Plan**: Pricing per locale + destination
- **Destination**: Localized destination content
- **Post**: Blog posts with locale support

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Next Steps

1. Seed the database with initial data (destinations, plans)
2. Implement authentication flows
3. Build out UI components
4. Integrate Stripe checkout flow
5. Add SEO metadata per locale
6. Deploy to Vercel

## License

MIT

