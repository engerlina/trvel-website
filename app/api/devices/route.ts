import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const brands = await prisma.deviceBrand.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        devices: {
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    // Transform to the format expected by EsimChecker
    // Includes slugs for linking to device pages
    const deviceData = brands.reduce((acc, brand) => {
      acc[brand.name] = {
        brandSlug: brand.slug,
        compatible: brand.devices
          .filter(d => d.is_compatible)
          .map(d => d.model_name),
        notCompatible: brand.devices
          .filter(d => !d.is_compatible)
          .map(d => d.model_name),
        // Map model names to slugs for linking
        deviceSlugs: brand.devices.reduce((slugMap, d) => {
          slugMap[d.model_name] = d.slug;
          return slugMap;
        }, {} as Record<string, string>),
        checkPath: brand.settings_path || '',
      };
      return acc;
    }, {} as Record<string, { brandSlug: string; compatible: string[]; notCompatible: string[]; deviceSlugs: Record<string, string>; checkPath: string }>);

    return NextResponse.json(deviceData);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}
