import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en-au';

  try {
    const destinations = await prisma.destination.findMany({
      where: {
        locale: locale,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        country_iso: true,
        region: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}
