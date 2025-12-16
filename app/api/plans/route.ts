import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/plans?locale=en-au
// Returns all plans for a locale, keyed by destination_slug
// Also includes competitor info from the Competitor table (based on currency)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en-au';

  try {
    // Fetch all plans for this locale
    const plans = await prisma.plan.findMany({
      where: { locale },
      select: {
        destination_slug: true,
        currency: true,
        price_5day: true,
        price_7day: true,
        price_15day: true,
      },
    });

    // Get all competitors (keyed by currency)
    const competitors = await prisma.competitor.findMany();
    const competitorMap = new Map(
      competitors.map(c => [c.currency, { name: c.name, daily_rate: Number(c.daily_rate) }])
    );

    // Convert to a map keyed by destination_slug
    const plansMap: Record<string, {
      price_5day: number | null;
      price_7day: number | null;
      price_15day: number | null;
      currency: string;
      competitor_name: string | null;
      competitor_daily_rate: number | null;
    }> = {};

    for (const plan of plans) {
      const competitor = competitorMap.get(plan.currency);
      plansMap[plan.destination_slug] = {
        price_5day: plan.price_5day ? Number(plan.price_5day) : null,
        price_7day: plan.price_7day ? Number(plan.price_7day) : null,
        price_15day: plan.price_15day ? Number(plan.price_15day) : null,
        currency: plan.currency,
        competitor_name: competitor?.name || null,
        competitor_daily_rate: competitor?.daily_rate || null,
      };
    }

    return NextResponse.json(plansMap);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
