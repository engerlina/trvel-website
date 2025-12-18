import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DurationOption } from '@/types';

// GET /api/plans?locale=en-au
// Returns all plans for a locale, keyed by destination_slug
// Now returns flexible durations array instead of fixed price columns
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
        durations: true,
        default_durations: true,
        best_daily_rate: true,
      },
    });

    // Get all competitors (keyed by currency)
    const competitors = await prisma.competitor.findMany();
    const competitorMap = new Map(
      competitors.map(c => [c.currency, { name: c.name, daily_rate: Number(c.daily_rate) }])
    );

    // Convert to a map keyed by destination_slug
    const plansMap: Record<string, {
      durations: DurationOption[];
      default_durations: number[];
      best_daily_rate: number | null;
      currency: string;
      competitor_name: string | null;
      competitor_daily_rate: number | null;
    }> = {};

    for (const plan of plans) {
      const competitor = competitorMap.get(plan.currency);
      plansMap[plan.destination_slug] = {
        durations: plan.durations as unknown as DurationOption[],
        default_durations: plan.default_durations,
        best_daily_rate: plan.best_daily_rate ? Number(plan.best_daily_rate) : null,
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
