import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOCALES = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'];

// City data with unique connectivity information
const CITIES_DATA: Record<string, Array<{
  slug: string;
  name: string;
  country_iso: string;
  airport_code?: string;
  airport_name?: string;
  connectivity_notes: string;
  popular_areas: string[];
  network_quality: number;
  timezone: string;
  population?: number;
}>> = {
  japan: [
    {
      slug: 'tokyo',
      name: 'Tokyo',
      country_iso: 'JP',
      airport_code: 'NRT',
      airport_name: 'Narita International Airport',
      connectivity_notes: 'Excellent 5G coverage throughout central Tokyo. Free WiFi widely available on trains and in convenience stores. Underground metro has LTE coverage.',
      popular_areas: ['Shibuya', 'Shinjuku', 'Harajuku', 'Akihabara', 'Ginza', 'Asakusa'],
      network_quality: 5,
      timezone: 'Asia/Tokyo',
      population: 13960000,
    },
    {
      slug: 'osaka',
      name: 'Osaka',
      country_iso: 'JP',
      airport_code: 'KIX',
      airport_name: 'Kansai International Airport',
      connectivity_notes: 'Strong 4G/5G coverage in Osaka city center. Good connectivity in Dotonbori and Namba areas. Train stations have free WiFi.',
      popular_areas: ['Dotonbori', 'Namba', 'Umeda', 'Shinsekai', 'Osaka Castle'],
      network_quality: 5,
      timezone: 'Asia/Tokyo',
      population: 2750000,
    },
    {
      slug: 'kyoto',
      name: 'Kyoto',
      country_iso: 'JP',
      airport_code: 'KIX',
      airport_name: 'Kansai International Airport (nearest)',
      connectivity_notes: 'Good 4G coverage in central Kyoto. Some temple areas have weaker signal. Bamboo groves may have reduced coverage.',
      popular_areas: ['Gion', 'Arashiyama', 'Fushimi Inari', 'Kinkaku-ji', 'Higashiyama'],
      network_quality: 4,
      timezone: 'Asia/Tokyo',
      population: 1460000,
    },
  ],
  thailand: [
    {
      slug: 'bangkok',
      name: 'Bangkok',
      country_iso: 'TH',
      airport_code: 'BKK',
      airport_name: 'Suvarnabhumi Airport',
      connectivity_notes: 'Excellent 4G/5G coverage throughout Bangkok. BTS and MRT have good signal. Major shopping malls offer free WiFi.',
      popular_areas: ['Sukhumvit', 'Silom', 'Khao San Road', 'Chatuchak', 'Siam Square'],
      network_quality: 5,
      timezone: 'Asia/Bangkok',
      population: 10700000,
    },
    {
      slug: 'phuket',
      name: 'Phuket',
      country_iso: 'TH',
      airport_code: 'HKT',
      airport_name: 'Phuket International Airport',
      connectivity_notes: 'Good 4G coverage in main tourist areas. Beach areas have reliable signal. Remote northern beaches may have weaker coverage.',
      popular_areas: ['Patong Beach', 'Kata Beach', 'Karon Beach', 'Old Town', 'Rawai'],
      network_quality: 4,
      timezone: 'Asia/Bangkok',
      population: 416582,
    },
    {
      slug: 'chiang-mai',
      name: 'Chiang Mai',
      country_iso: 'TH',
      airport_code: 'CNX',
      airport_name: 'Chiang Mai International Airport',
      connectivity_notes: 'Good 4G coverage in Old City and Nimman areas. Mountain areas and national parks may have limited signal.',
      popular_areas: ['Old City', 'Nimman', 'Night Bazaar', 'Doi Suthep', 'Riverside'],
      network_quality: 4,
      timezone: 'Asia/Bangkok',
      population: 127000,
    },
  ],
  'south-korea': [
    {
      slug: 'seoul',
      name: 'Seoul',
      country_iso: 'KR',
      airport_code: 'ICN',
      airport_name: 'Incheon International Airport',
      connectivity_notes: 'World-class 5G coverage throughout Seoul. Metro stations have excellent signal. Free WiFi ubiquitous in cafes and public spaces.',
      popular_areas: ['Gangnam', 'Myeongdong', 'Hongdae', 'Itaewon', 'Bukchon'],
      network_quality: 5,
      timezone: 'Asia/Seoul',
      population: 9700000,
    },
    {
      slug: 'busan',
      name: 'Busan',
      country_iso: 'KR',
      airport_code: 'PUS',
      airport_name: 'Gimhae International Airport',
      connectivity_notes: 'Excellent 5G coverage in Busan city center. Beach areas like Haeundae have strong signal. KTX stations have free WiFi.',
      popular_areas: ['Haeundae', 'Gwangalli', 'Gamcheon', 'Nampo-dong', 'Seomyeon'],
      network_quality: 5,
      timezone: 'Asia/Seoul',
      population: 3400000,
    },
  ],
  singapore: [
    {
      slug: 'singapore-city',
      name: 'Singapore',
      country_iso: 'SG',
      airport_code: 'SIN',
      airport_name: 'Changi Airport',
      connectivity_notes: 'Exceptional 5G coverage island-wide. MRT has excellent connectivity. Free Wireless@SG available throughout the city.',
      popular_areas: ['Marina Bay', 'Orchard Road', 'Sentosa', 'Chinatown', 'Little India', 'Clarke Quay'],
      network_quality: 5,
      timezone: 'Asia/Singapore',
      population: 5450000,
    },
  ],
  indonesia: [
    {
      slug: 'bali',
      name: 'Bali',
      country_iso: 'ID',
      airport_code: 'DPS',
      airport_name: 'Ngurah Rai International Airport',
      connectivity_notes: 'Good 4G coverage in Seminyak, Kuta, and Ubud. Remote rice terraces may have weaker signal. Beach clubs have WiFi.',
      popular_areas: ['Seminyak', 'Ubud', 'Canggu', 'Kuta', 'Nusa Dua', 'Uluwatu'],
      network_quality: 4,
      timezone: 'Asia/Makassar',
      population: 4300000,
    },
    {
      slug: 'jakarta',
      name: 'Jakarta',
      country_iso: 'ID',
      airport_code: 'CGK',
      airport_name: 'Soekarno-Hatta International Airport',
      connectivity_notes: 'Good 4G coverage in central Jakarta. Traffic can affect connectivity during peak hours. Major malls have strong WiFi.',
      popular_areas: ['Menteng', 'Kemang', 'SCBD', 'Kota Tua', 'Ancol'],
      network_quality: 4,
      timezone: 'Asia/Jakarta',
      population: 10560000,
    },
  ],
  malaysia: [
    {
      slug: 'kuala-lumpur',
      name: 'Kuala Lumpur',
      country_iso: 'MY',
      airport_code: 'KUL',
      airport_name: 'Kuala Lumpur International Airport',
      connectivity_notes: 'Excellent 4G/5G coverage in KL city center. Petronas Towers area has strong signal. LRT and MRT have good connectivity.',
      popular_areas: ['KLCC', 'Bukit Bintang', 'Chinatown', 'Bangsar', 'Mont Kiara'],
      network_quality: 5,
      timezone: 'Asia/Kuala_Lumpur',
      population: 1780000,
    },
    {
      slug: 'penang',
      name: 'Penang',
      country_iso: 'MY',
      airport_code: 'PEN',
      airport_name: 'Penang International Airport',
      connectivity_notes: 'Good 4G coverage in George Town. Heritage areas have reliable signal. Beach resorts in Batu Ferringhi have good connectivity.',
      popular_areas: ['George Town', 'Batu Ferringhi', 'Gurney Drive', 'Little India', 'Armenian Street'],
      network_quality: 4,
      timezone: 'Asia/Kuala_Lumpur',
      population: 708127,
    },
  ],
  taiwan: [
    {
      slug: 'taipei',
      name: 'Taipei',
      country_iso: 'TW',
      airport_code: 'TPE',
      airport_name: 'Taiwan Taoyuan International Airport',
      connectivity_notes: 'Excellent 4G/5G coverage throughout Taipei. MRT has strong signal. Free iTaiwan WiFi available in tourist areas.',
      popular_areas: ['Xinyi', 'Ximending', 'Shilin Night Market', 'Taipei 101', 'Beitou'],
      network_quality: 5,
      timezone: 'Asia/Taipei',
      population: 2600000,
    },
  ],
  australia: [
    {
      slug: 'sydney',
      name: 'Sydney',
      country_iso: 'AU',
      airport_code: 'SYD',
      airport_name: 'Sydney Kingsford Smith Airport',
      connectivity_notes: 'Good 4G/5G coverage in Sydney CBD and suburbs. Train tunnels may have reduced signal. Beaches have reliable coverage.',
      popular_areas: ['Circular Quay', 'Bondi Beach', 'Darling Harbour', 'The Rocks', 'Manly'],
      network_quality: 4,
      timezone: 'Australia/Sydney',
      population: 5300000,
    },
    {
      slug: 'melbourne',
      name: 'Melbourne',
      country_iso: 'AU',
      airport_code: 'MEL',
      airport_name: 'Melbourne Airport',
      connectivity_notes: 'Good 4G/5G coverage in Melbourne CBD. Tram network has reliable signal. Great Ocean Road may have gaps in coverage.',
      popular_areas: ['Federation Square', 'Southbank', 'St Kilda', 'Fitzroy', 'Docklands'],
      network_quality: 4,
      timezone: 'Australia/Melbourne',
      population: 5000000,
    },
  ],
  usa: [
    {
      slug: 'new-york',
      name: 'New York',
      country_iso: 'US',
      airport_code: 'JFK',
      airport_name: 'John F. Kennedy International Airport',
      connectivity_notes: 'Good 4G/5G coverage in Manhattan. Subway has expanding cellular coverage. Times Square area has excellent signal.',
      popular_areas: ['Times Square', 'Central Park', 'Brooklyn', 'SoHo', 'Upper East Side'],
      network_quality: 4,
      timezone: 'America/New_York',
      population: 8300000,
    },
    {
      slug: 'los-angeles',
      name: 'Los Angeles',
      country_iso: 'US',
      airport_code: 'LAX',
      airport_name: 'Los Angeles International Airport',
      connectivity_notes: 'Good 4G/5G coverage in LA metro area. Beach cities have reliable signal. Canyon areas may have reduced coverage.',
      popular_areas: ['Hollywood', 'Santa Monica', 'Beverly Hills', 'Downtown', 'Venice Beach'],
      network_quality: 4,
      timezone: 'America/Los_Angeles',
      population: 3900000,
    },
  ],
  spain: [
    {
      slug: 'barcelona',
      name: 'Barcelona',
      country_iso: 'ES',
      airport_code: 'BCN',
      airport_name: 'Barcelona-El Prat Airport',
      connectivity_notes: 'Good 4G coverage in Barcelona city center. La Rambla and Gothic Quarter have reliable signal. Metro has good connectivity.',
      popular_areas: ['La Rambla', 'Gothic Quarter', 'Barceloneta', 'Eixample', 'Montjuic'],
      network_quality: 4,
      timezone: 'Europe/Madrid',
      population: 1600000,
    },
    {
      slug: 'madrid',
      name: 'Madrid',
      country_iso: 'ES',
      airport_code: 'MAD',
      airport_name: 'Madrid-Barajas Airport',
      connectivity_notes: 'Good 4G coverage throughout Madrid. Gran Via and Sol have excellent signal. Metro has reliable connectivity.',
      popular_areas: ['Gran Via', 'Sol', 'Retiro', 'Malasana', 'La Latina'],
      network_quality: 4,
      timezone: 'Europe/Madrid',
      population: 3200000,
    },
  ],
  greece: [
    {
      slug: 'athens',
      name: 'Athens',
      country_iso: 'GR',
      airport_code: 'ATH',
      airport_name: 'Athens International Airport',
      connectivity_notes: 'Good 4G coverage in Athens city center. Acropolis area has reliable signal. Metro stations have connectivity.',
      popular_areas: ['Plaka', 'Monastiraki', 'Syntagma', 'Acropolis', 'Psiri'],
      network_quality: 4,
      timezone: 'Europe/Athens',
      population: 660000,
    },
    {
      slug: 'santorini',
      name: 'Santorini',
      country_iso: 'GR',
      airport_code: 'JTR',
      airport_name: 'Santorini Airport',
      connectivity_notes: 'Moderate 4G coverage in Fira and Oia. Cliff villages have reliable signal. Remote beaches may have weaker coverage.',
      popular_areas: ['Fira', 'Oia', 'Kamari Beach', 'Perissa', 'Akrotiri'],
      network_quality: 3,
      timezone: 'Europe/Athens',
      population: 15550,
    },
  ],
  china: [
    {
      slug: 'shanghai',
      name: 'Shanghai',
      country_iso: 'CN',
      airport_code: 'PVG',
      airport_name: 'Shanghai Pudong International Airport',
      connectivity_notes: 'Excellent 4G/5G coverage in Shanghai. Note: VPN may be required for Western apps. Metro has strong signal.',
      popular_areas: ['The Bund', 'Pudong', 'French Concession', 'Nanjing Road', 'Jing\'an'],
      network_quality: 5,
      timezone: 'Asia/Shanghai',
      population: 24280000,
    },
    {
      slug: 'beijing',
      name: 'Beijing',
      country_iso: 'CN',
      airport_code: 'PEK',
      airport_name: 'Beijing Capital International Airport',
      connectivity_notes: 'Excellent 4G/5G coverage in Beijing. VPN recommended for Western services. Forbidden City area has good signal.',
      popular_areas: ['Forbidden City', 'Tiananmen', 'Wangfujing', 'Sanlitun', 'Houhai'],
      network_quality: 5,
      timezone: 'Asia/Shanghai',
      population: 21540000,
    },
  ],
};

// Localized names for non-English locales
const LOCALIZED_NAMES: Record<string, Record<string, string>> = {
  'ms-my': {
    'tokyo': 'Tokyo',
    'osaka': 'Osaka',
    'kyoto': 'Kyoto',
    'bangkok': 'Bangkok',
    'phuket': 'Phuket',
    'chiang-mai': 'Chiang Mai',
    'seoul': 'Seoul',
    'busan': 'Busan',
    'singapore-city': 'Singapura',
    'bali': 'Bali',
    'jakarta': 'Jakarta',
    'kuala-lumpur': 'Kuala Lumpur',
    'penang': 'Pulau Pinang',
    'taipei': 'Taipei',
    'sydney': 'Sydney',
    'melbourne': 'Melbourne',
    'new-york': 'New York',
    'los-angeles': 'Los Angeles',
    'barcelona': 'Barcelona',
    'madrid': 'Madrid',
    'athens': 'Athens',
    'santorini': 'Santorini',
    'shanghai': 'Shanghai',
    'beijing': 'Beijing',
  },
  'id-id': {
    'tokyo': 'Tokyo',
    'osaka': 'Osaka',
    'kyoto': 'Kyoto',
    'bangkok': 'Bangkok',
    'phuket': 'Phuket',
    'chiang-mai': 'Chiang Mai',
    'seoul': 'Seoul',
    'busan': 'Busan',
    'singapore-city': 'Singapura',
    'bali': 'Bali',
    'jakarta': 'Jakarta',
    'kuala-lumpur': 'Kuala Lumpur',
    'penang': 'Penang',
    'taipei': 'Taipei',
    'sydney': 'Sydney',
    'melbourne': 'Melbourne',
    'new-york': 'New York',
    'los-angeles': 'Los Angeles',
    'barcelona': 'Barcelona',
    'madrid': 'Madrid',
    'athens': 'Athena',
    'santorini': 'Santorini',
    'shanghai': 'Shanghai',
    'beijing': 'Beijing',
  },
};

async function main() {
  console.log('Starting city seeding...\n');

  let totalCreated = 0;
  let totalSkipped = 0;

  // First, ensure destinations exist and get their IDs
  const destinations = await prisma.destination.findMany({
    select: { id: true, slug: true, locale: true },
  });

  // Create a map for quick lookup
  const destinationMap = new Map<string, number>();
  for (const dest of destinations) {
    destinationMap.set(`${dest.slug}-${dest.locale}`, dest.id);
  }

  // Seed cities for each destination and locale
  for (const [destSlug, cities] of Object.entries(CITIES_DATA)) {
    console.log(`\nProcessing destination: ${destSlug}`);

    for (const city of cities) {
      for (const locale of LOCALES) {
        // Get localized name if available
        const localizedName = LOCALIZED_NAMES[locale]?.[city.slug] || city.name;

        // Get destination ID if exists
        const destinationId = destinationMap.get(`${destSlug}-${locale}`);

        try {
          // Check if city already exists
          const existing = await prisma.city.findUnique({
            where: { slug_locale: { slug: city.slug, locale } },
          });

          if (existing) {
            totalSkipped++;
            continue;
          }

          await prisma.city.create({
            data: {
              slug: city.slug,
              locale,
              name: localizedName,
              country_iso: city.country_iso,
              destination_id: destinationId,
              airport_code: city.airport_code,
              airport_name: city.airport_name,
              connectivity_notes: city.connectivity_notes,
              popular_areas: city.popular_areas,
              network_quality: city.network_quality,
              timezone: city.timezone,
              population: city.population,
            },
          });

          totalCreated++;
          console.log(`  Created: ${city.name} (${locale})`);
        } catch (error) {
          console.error(`  Error creating ${city.name} (${locale}):`, error);
        }
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`City seeding complete!`);
  console.log(`Created: ${totalCreated}`);
  console.log(`Skipped (existing): ${totalSkipped}`);
  console.log(`========================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
