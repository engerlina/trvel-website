import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Star,
  Quote,
  MapPin,
  Plane,
  Users,
  ThumbsUp,
  Award,
  ArrowRight,
  CheckCircle,
  Shield,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface ReviewsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Customer Reviews | Trvel eSIM';
  const description = 'See what 50,000+ Australian travellers say about Trvel eSIM. 4.9-star rated travel eSIM for Japan, Thailand, Bali, and 190+ destinations.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/reviews`,
      languages: {
        'x-default': `${BASE_URL}/en-au/reviews`,
        'en-AU': `${BASE_URL}/en-au/reviews`,
        'en-SG': `${BASE_URL}/en-sg/reviews`,
        'en-GB': `${BASE_URL}/en-gb/reviews`,
        'en-US': `${BASE_URL}/en-us/reviews`,
        'ms-MY': `${BASE_URL}/ms-my/reviews`,
        'id-ID': `${BASE_URL}/id-id/reviews`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/reviews`,
      type: 'website',
    },
  };
}

const reviews = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Sydney, NSW',
    destination: 'Japan',
    rating: 5,
    title: 'Lifesaver for my Tokyo business trip',
    quote: "Had the eSIM set up on my iPhone before I even left Sydney. Landed at Narita and was connected instantly - no hunting for SIM card vending machines. Data was fast enough for video calls with the office. The Australian support team responded within minutes when I had a setup question. Will definitely use again for my next trip.",
    tripType: 'Business',
    verified: true,
  },
  {
    id: 2,
    name: 'David & Michelle R.',
    location: 'Melbourne, VIC',
    destination: 'Thailand',
    rating: 5,
    title: 'Perfect for family holidays',
    quote: "Used Trvel for our 2-week family holiday in Thailand - Bangkok, Chiang Mai, and Phuket. Set up eSIMs on 4 phones before we left. Kids could use Google Maps, we could book Grab rides, and stayed connected the whole trip. So much easier than the chaos of buying SIMs at the airport with jetlagged kids. Saved us heaps compared to Telstra roaming.",
    tripType: 'Family',
    verified: true,
  },
  {
    id: 3,
    name: 'Jess T.',
    location: 'Brisbane, QLD',
    destination: 'Bali',
    rating: 5,
    title: 'So easy - even for first-timers',
    quote: "First time using an eSIM and was a bit nervous, but the setup guide made it super easy. Worked perfectly in Bali - Seminyak, Ubud, and even Nusa Penida. Could post to Insta, video call home, and use Google Maps without worrying about data. Australian-owned company was a plus for me.",
    tripType: 'Solo',
    verified: true,
  },
  {
    id: 4,
    name: 'Chris L.',
    location: 'Perth, WA',
    destination: 'Japan',
    rating: 5,
    title: 'Worked perfectly in the ski mountains',
    quote: "Took this to Niseko and Hakuba for the ski season. Worked perfectly even up in the mountains. Used it to check snow reports, find restaurants, and keep the family group chat updated with powder photos. QR code came through in about 2 minutes after I bought it. No dramas at all.",
    tripType: 'Adventure',
    verified: true,
  },
  {
    id: 5,
    name: 'Amanda K.',
    location: 'Adelaide, SA',
    destination: 'Singapore',
    rating: 5,
    title: 'Great value for short trips',
    quote: "Had a 3-day stopover in Singapore before flying to Europe. The eSIM was perfect - didn't want to buy a physical SIM for just a few days. Set it up on the flight over (downloaded the QR code earlier) and activated the moment we landed at Changi. Great value for a short trip.",
    tripType: 'Stopover',
    verified: true,
  },
  {
    id: 6,
    name: 'Tom H.',
    location: 'Gold Coast, QLD',
    destination: 'Vietnam',
    rating: 5,
    title: 'Essential for backpacking',
    quote: "Backpacked through Vietnam for a month - Hanoi, Hoi An, Ho Chi Minh, and everywhere in between. The eSIM worked the whole time with solid coverage. Used it for Grab, Google Translate (essential!), and hostel bookings. Much easier than trying to sort a SIM in a foreign country when you don't speak the language.",
    tripType: 'Backpacking',
    verified: true,
  },
  {
    id: 7,
    name: 'Emily W.',
    location: 'Sydney, NSW',
    destination: 'South Korea',
    rating: 5,
    title: 'Fast 5G speeds in Seoul',
    quote: "Went to Seoul for concerts and needed reliable data for Naver Map (Google Maps doesn't work well there!), KakaoTalk, and live streaming. The eSIM worked brilliantly - fast 5G speeds everywhere. My friend bought a SIM at Incheon and it took her an hour. I was connected in 2 minutes.",
    tripType: 'Leisure',
    verified: true,
  },
  {
    id: 8,
    name: 'Raj P.',
    location: 'Melbourne, VIC',
    destination: 'Malaysia',
    rating: 5,
    title: 'Much easier than buying local SIMs',
    quote: "Visit family in KL every year. Used to buy a Maxis SIM each time but this year tried Trvel's eSIM. So much more convenient - set up before I left and worked from the moment I landed. Covered Kuala Lumpur, Penang, and even Langkawi with no issues. 24/7 support when I had a question too.",
    tripType: 'Family Visit',
    verified: true,
  },
  {
    id: 9,
    name: 'Ben & Lisa C.',
    location: 'Canberra, ACT',
    destination: 'Multi-country Asia',
    rating: 5,
    title: 'Perfect for multi-country trips',
    quote: "Did a 3-week multi-stop trip through Asia. Got separate eSIMs for Japan, Thailand, and Bali. Each one worked perfectly in its country. The ability to have multiple eSIMs on one phone is a game changer. Way better than swapping physical SIMs and keeping track of them. Highly recommend.",
    tripType: 'Multi-destination',
    verified: true,
  },
  {
    id: 10,
    name: 'Michael S.',
    location: 'Sydney, NSW',
    destination: 'Thailand',
    rating: 5,
    title: 'Instant delivery saved me',
    quote: "Got called to Bangkok with 24 hours notice for work. Ordered the eSIM at 10pm, had the QR code in my email in 2 minutes, and was set up before bed. No stress about finding data when I landed for an 8am meeting. Exactly what I needed. Australian company, instant delivery, just works.",
    tripType: 'Business',
    verified: true,
  },
];

const stats = [
  { value: '50,000+', label: 'Happy Travellers' },
  { value: '4.9', label: 'Average Rating' },
  { value: '190+', label: 'Countries Covered' },
  { value: '<3 min', label: 'Avg Response Time' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-16 md:py-24">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-yellow-500" />
                4.9 out of 5 stars
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Trusted by 50,000+ Aussie Travellers
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                Real reviews from real customers. See why Australian travellers choose Trvel
                for their Japan, Thailand, Bali, and international trips.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-navy-400">
                  <Shield className="w-5 h-5 text-success-500" />
                  <span className="font-medium">Verified Purchases</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Award className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">Australian Owned</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <ThumbsUp className="w-5 h-5 text-accent-500" />
                  <span className="font-medium">Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b border-cream-200">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-display font-bold text-brand-600">{stat.value}</p>
                  <p className="text-body-sm text-navy-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="relative bg-white rounded-2xl border border-cream-200 shadow-soft p-6 md:p-8 transition-all duration-300 hover:shadow-soft-lg hover:border-brand-200"
                >
                  {/* Trip Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-cream-100 text-navy-500 text-xs font-medium rounded-full">
                      {review.tripType}
                    </span>
                    <Quote className="w-6 h-6 text-brand-200" aria-hidden="true" />
                  </div>

                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-navy-500">{review.name}</h3>
                      {review.verified && (
                        <CheckCircle className="w-4 h-4 text-success-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-navy-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {review.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        {review.destination}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    <StarRating rating={review.rating} />
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-navy-500 mb-2">
                    &ldquo;{review.title}&rdquo;
                  </h4>

                  {/* Quote */}
                  <blockquote className="text-navy-400 leading-relaxed text-sm">
                    {review.quote}
                  </blockquote>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Overall Rating Section */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-display font-bold text-navy-500 mb-2">4.9 out of 5</p>
              <p className="text-navy-400 mb-8">Based on 50,000+ verified reviews</p>

              <div className="space-y-3 max-w-md mx-auto">
                {[
                  { stars: 5, percentage: 94 },
                  { stars: 4, percentage: 4 },
                  { stars: 3, percentage: 1 },
                  { stars: 2, percentage: 0.5 },
                  { stars: 1, percentage: 0.5 },
                ].map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <span className="text-sm text-navy-500 w-12">{item.stars} star</span>
                    <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-navy-400 w-12">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                Join 50,000+ Happy Travellers
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your eSIM in 2 minutes and stay connected on your next trip.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
                >
                  Browse Destinations
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/guarantee"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Shield className="w-5 h-5" />
                  Our Guarantee
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
