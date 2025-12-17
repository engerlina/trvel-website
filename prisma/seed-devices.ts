import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BrandData {
  name: string;
  slug: string;
  settings_path: string;
  compatible: string[];
  notCompatible: string[];
}

const deviceData: BrandData[] = [
  {
    name: 'Apple',
    slug: 'apple',
    settings_path: 'Settings → Mobile Data → Add eSIM',
    compatible: [
      'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17 Air', 'iPhone 17',
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13 mini', 'iPhone 13',
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12 mini', 'iPhone 12',
      'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone XS Max', 'iPhone XS', 'iPhone XR',
      'iPhone SE (3rd generation)', 'iPhone SE (2nd generation)',
      'iPad Pro (all models with cellular)',
      'iPad Air (3rd generation and later)',
      'iPad (7th generation and later)',
      'iPad mini (5th generation and later)',
    ],
    notCompatible: [
      'iPhone X', 'iPhone 8', 'iPhone 8 Plus', 'iPhone 7', 'iPhone 7 Plus',
      'iPhone 6s', 'iPhone 6s Plus', 'iPhone SE (1st generation)',
    ],
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    settings_path: 'Settings → Connections → SIM Manager → Add eSIM',
    compatible: [
      'Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25', 'Galaxy S25 Edge',
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S24 FE',
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
      'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
      'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3', 'Galaxy Z Fold 2',
      'Galaxy Z Flip 6', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3', 'Galaxy Z Flip',
      'Galaxy Note 20 Ultra', 'Galaxy Note 20',
      'Galaxy A55', 'Galaxy A54', 'Galaxy A35', 'Galaxy A34',
    ],
    notCompatible: [
      'Galaxy S10', 'Galaxy S10+', 'Galaxy S10e', 'Galaxy S9', 'Galaxy S9+',
      'Galaxy Note 10', 'Galaxy Note 10+', 'Galaxy Note 9',
      'Galaxy A53', 'Galaxy A52', 'Galaxy A51', 'Galaxy A50',
    ],
  },
  {
    name: 'Google',
    slug: 'google',
    settings_path: 'Settings → Network & Internet → SIMs → Add eSIM',
    compatible: [
      'Pixel 10 Pro XL', 'Pixel 10 Pro', 'Pixel 10',
      'Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 9a', 'Pixel 9 Pro Fold',
      'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
      'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
      'Pixel 5', 'Pixel 5a',
      'Pixel 4 XL', 'Pixel 4', 'Pixel 4a', 'Pixel 4a 5G',
      'Pixel 3 XL', 'Pixel 3', 'Pixel 3a XL', 'Pixel 3a',
      'Pixel Fold',
    ],
    notCompatible: [
      'Pixel 2 XL', 'Pixel 2', 'Pixel XL', 'Pixel',
    ],
  },
  {
    name: 'OnePlus',
    slug: 'oneplus',
    settings_path: 'Settings → Mobile Network → SIM & Network → Add eSIM',
    compatible: [
      'OnePlus 13', 'OnePlus 13R',
      'OnePlus 12', 'OnePlus 12R',
      'OnePlus 11', 'OnePlus 11R',
      'OnePlus Open',
    ],
    notCompatible: [
      'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 10R',
      'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9R',
      'OnePlus 8 Pro', 'OnePlus 8', 'OnePlus 8T',
    ],
  },
  {
    name: 'Xiaomi',
    slug: 'xiaomi',
    settings_path: 'Settings → SIM Cards & Mobile Networks → Add eSIM',
    compatible: [
      'Xiaomi 15 Ultra', 'Xiaomi 15 Pro', 'Xiaomi 15',
      'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 14T Pro', 'Xiaomi 14T',
      'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 13T Pro', 'Xiaomi 13T', 'Xiaomi 13 Lite',
      'Xiaomi 12T Pro',
      'Redmi Note 14 Pro+ 5G', 'Redmi Note 14 Pro+', 'Redmi Note 14 Pro 5G', 'Redmi Note 14 Pro',
      'Redmi Note 13 Pro+', 'Redmi Note 13 Pro',
      'Redmi Note 11 Pro 5G',
      'Poco X7',
    ],
    notCompatible: [
      'Xiaomi 12 Pro', 'Xiaomi 12', 'Xiaomi 12 Lite',
      'Xiaomi 11 Ultra', 'Xiaomi 11 Pro', 'Xiaomi 11', 'Xiaomi 11T Pro', 'Xiaomi 11T',
      'Redmi Note 12 series', 'Redmi Note 11 series (non-Pro)',
    ],
  },
  {
    name: 'Oppo',
    slug: 'oppo',
    settings_path: 'Settings → SIM Card & Mobile Data → Add eSIM',
    compatible: [
      'Find X8 Pro', 'Find X8',
      'Find X7 Ultra', 'Find X7',
      'Find X6 Pro', 'Find X6',
      'Find X5 Pro', 'Find X5',
      'Find X3 Pro', 'Find X3',
      'Find N5', 'Find N3', 'Find N3 Flip', 'Find N2', 'Find N2 Flip',
      'Reno 15 Pro', 'Reno 15', 'Reno 14 Pro', 'Reno 14',
      'Reno 9A', 'Reno 6 Pro 5G', 'Reno 5A',
      'A55s',
    ],
    notCompatible: [
      'Find X5 Lite',
      'Reno 10 series', 'Reno 8 series', 'Reno 7 series',
      'A series (most models)',
    ],
  },
  {
    name: 'Motorola',
    slug: 'motorola',
    settings_path: 'Settings → Network & Internet → SIMs → Add eSIM',
    compatible: [
      'Razr Ultra 2025', 'Razr 60 Ultra', 'Razr 60',
      'Razr 50 Ultra', 'Razr 50',
      'Razr 40 Ultra', 'Razr 40',
      'Razr (2023)', 'Razr (2022)', 'Razr+', 'Razr 5G',
      'Edge 60 Pro', 'Edge 60', 'Edge 60 Fusion', 'Edge 60 Stylus',
      'Edge 50 Ultra', 'Edge 50 Pro', 'Edge 50', 'Edge 50 Neo', 'Edge 50 Fusion',
      'Edge 40 Pro', 'Edge 40', 'Edge 40 Neo',
      'Edge+', 'Edge',
      'ThinkPhone 25',
      'Moto G Power (2025)', 'Moto G (2025)',
      'Moto G Power (2024)', 'Moto G (2024)',
      'Moto G85', 'Moto G75', 'Moto G54 5G', 'Moto G53 5G', 'Moto G53J 5G', 'Moto G52J 5G',
      'Moto G35', 'Moto G34',
      'Moto G Stylus 5G',
    ],
    notCompatible: [
      'Moto G series (older models)',
      'Moto E series',
      'Moto One series',
    ],
  },
  {
    name: 'Huawei',
    slug: 'huawei',
    settings_path: 'Settings → Mobile Network → SIM Management',
    compatible: [
      'Pura 70 Ultra', 'Pura 70 Pro', 'Pura 70',
      'Pura X',
      'Mate 50 Pro', 'Mate 50',
      'Mate 40 Pro',
      'Mate Xs 2', 'Mate X2',
      'P40 Pro', 'P40',
    ],
    notCompatible: [
      'P50 Pro', 'P50',
      'P40 Pro+',
      'Mate 30 series',
      'P30 series',
      'Nova series',
    ],
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Track used slugs per brand to handle duplicates
const usedSlugs: Record<number, Set<string>> = {};

async function main() {
  console.log('Seeding device compatibility data...\n');

  for (const brandData of deviceData) {
    console.log(`Processing ${brandData.name}...`);

    // Upsert brand
    const brand = await prisma.deviceBrand.upsert({
      where: { slug: brandData.slug },
      update: {
        name: brandData.name,
        settings_path: brandData.settings_path,
        sort_order: deviceData.indexOf(brandData),
      },
      create: {
        name: brandData.name,
        slug: brandData.slug,
        settings_path: brandData.settings_path,
        sort_order: deviceData.indexOf(brandData),
      },
    });

    // Delete existing devices for this brand (to update cleanly)
    await prisma.device.deleteMany({
      where: { brand_id: brand.id },
    });

    // Track used slugs for this brand
    const brandSlugs = new Set<string>();

    // Helper to get unique slug
    const getUniqueSlug = (name: string): string => {
      let baseSlug = slugify(name);
      let slug = baseSlug;
      let counter = 1;
      while (brandSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      brandSlugs.add(slug);
      return slug;
    };

    // Insert compatible devices
    let sortOrder = 0;
    for (const modelName of brandData.compatible) {
      await prisma.device.create({
        data: {
          brand_id: brand.id,
          model_name: modelName,
          slug: getUniqueSlug(modelName),
          is_compatible: true,
          sort_order: sortOrder++,
        },
      });
    }

    // Insert non-compatible devices
    for (const modelName of brandData.notCompatible) {
      await prisma.device.create({
        data: {
          brand_id: brand.id,
          model_name: modelName,
          slug: getUniqueSlug(modelName),
          is_compatible: false,
          sort_order: sortOrder++,
        },
      });
    }

    console.log(`  - Added ${brandData.compatible.length} compatible devices`);
    console.log(`  - Added ${brandData.notCompatible.length} non-compatible devices`);
  }

  console.log('\nDevice seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
