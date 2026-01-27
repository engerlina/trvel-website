import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

// All testimonials with destination mapping and profile pictures
// Male names matched with male pictures, female names with female pictures
const allTestimonials = [
  {
    id: 'sarah-m',
    name: 'Sarah M.',
    location: 'Sydney, NSW',
    destination: 'japan',
    destinationDisplay: 'Japan',
    rating: 5,
    quote: "Lifesaver for my Tokyo business trip. Had the eSIM set up on my iPhone before I even left Sydney. Landed at Narita and was connected instantly - no hunting for SIM card vending machines. The Australian support team responded within minutes when I had a setup question.",
    shortQuote: "Set up in 2 minutes. Connected the moment I landed in Tokyo.",
    image: '/profilepics/picture_woman_01.png',
    theme: 'business',
  },
  {
    id: 'david-r',
    name: 'David R.',
    location: 'Melbourne, VIC',
    destination: 'thailand',
    destinationDisplay: 'Thailand',
    rating: 5,
    quote: "Used Trvel for our 2-week family holiday in Thailand - Bangkok, Chiang Mai, and Phuket. Set up eSIMs on 4 phones before we left. Kids could use Google Maps, we could book Grab rides, and stayed connected the whole trip. Saved us heaps compared to Telstra roaming.",
    shortQuote: "So much easier than airport SIM chaos with jetlagged kids.",
    image: '/profilepics/picture_man_01.png',
    theme: 'family',
  },
  {
    id: 'jess-t',
    name: 'Jess T.',
    location: 'Brisbane, QLD',
    destination: 'indonesia',
    destinationDisplay: 'Bali',
    rating: 5,
    quote: "First time using an eSIM and was a bit nervous, but the setup guide made it super easy. Worked perfectly in Bali - Seminyak, Ubud, and even Nusa Penida. Could post to Insta, video call home, and use Google Maps without worrying about data.",
    shortQuote: "First time using eSIM. Setup guide made it super easy.",
    image: '/profilepics/picture_woman_02.png',
    theme: 'solo',
  },
  {
    id: 'chris-l',
    name: 'Chris L.',
    location: 'Perth, WA',
    destination: 'japan',
    destinationDisplay: 'Japan',
    rating: 5,
    quote: "Took this to Niseko and Hakuba for the ski season. Worked perfectly even up in the mountains. Used it to check snow reports, find restaurants, and keep the family group chat updated with powder photos. QR code came through in about 2 minutes after I bought it.",
    shortQuote: "Worked perfectly even up in the ski mountains.",
    image: '/profilepics/picture_man_02.png',
    theme: 'adventure',
  },
  {
    id: 'amanda-k',
    name: 'Amanda K.',
    location: 'Adelaide, SA',
    destination: 'singapore',
    destinationDisplay: 'Singapore',
    rating: 5,
    quote: "Had a 3-day stopover in Singapore before flying to Europe. The eSIM was perfect - didn't want to buy a physical SIM for just a few days. Set it up on the flight over and activated the moment we landed at Changi. Great value for a short trip.",
    shortQuote: "Perfect for my 3-day Singapore stopover. Great value.",
    image: '/profilepics/picture_woman_03.png',
    theme: 'stopover',
  },
  {
    id: 'tom-h',
    name: 'Tom H.',
    location: 'Gold Coast, QLD',
    destination: 'vietnam',
    destinationDisplay: 'Vietnam',
    rating: 5,
    quote: "Backpacked through Vietnam for a month - Hanoi, Hoi An, Ho Chi Minh, and everywhere in between. The eSIM worked the whole time with solid coverage. Used it for Grab, Google Translate (essential!), and hostel bookings. Much easier than sorting a SIM in a foreign country.",
    shortQuote: "Much easier than sorting a SIM when you don't speak the language.",
    image: '/profilepics/picture_man_03.png',
    theme: 'backpacker',
  },
  {
    id: 'emily-w',
    name: 'Emily W.',
    location: 'Sydney, NSW',
    destination: 'south-korea',
    destinationDisplay: 'South Korea',
    rating: 5,
    quote: "Went to Seoul for concerts and needed reliable data for Naver Map (Google Maps doesn't work well there!), KakaoTalk, and live streaming. The eSIM worked brilliantly - fast 5G speeds everywhere. My friend took an hour at the airport. I was connected in 2 minutes.",
    shortQuote: "My friend took an hour at the airport. I was connected in 2 mins.",
    image: '/profilepics/picture_woman_04.png',
    theme: 'entertainment',
  },
  {
    id: 'raj-p',
    name: 'Raj P.',
    location: 'Melbourne, VIC',
    destination: 'malaysia',
    destinationDisplay: 'Malaysia',
    rating: 5,
    quote: "Visit family in KL every year. Used to buy a Maxis SIM each time but this year tried Trvel's eSIM. So much more convenient - set up before I left and worked from the moment I landed. Covered Kuala Lumpur, Penang, and even Langkawi with no issues.",
    shortQuote: "24/7 support when I had a question. Way more convenient.",
    image: '/profilepics/picture_man_04.png',
    theme: 'vfr',
  },
  {
    id: 'ben-c',
    name: 'Ben C.',
    location: 'Canberra, ACT',
    destination: 'multi',
    destinationDisplay: 'Japan, Thailand, Bali',
    rating: 5,
    quote: "Did a 3-week multi-stop trip through Asia. Got separate eSIMs for Japan, Thailand, and Bali. Each one worked perfectly. The ability to have multiple eSIMs on one phone is a game changer. Way better than swapping physical SIMs and keeping track of them.",
    shortQuote: "Multiple eSIMs on one phone is a game changer.",
    image: '/profilepics/picture_man_05.png',
    theme: 'multi-country',
  },
  {
    id: 'michael-s',
    name: 'Michael S.',
    location: 'Sydney, NSW',
    destination: 'thailand',
    destinationDisplay: 'Thailand',
    rating: 5,
    quote: "Got called to Bangkok with 24 hours notice for work. Ordered the eSIM at 10pm, had the QR code in my email in 2 minutes, and was set up before bed. No stress about finding data when I landed for an 8am meeting. Australian company, instant delivery, just works.",
    shortQuote: "Ordered at 10pm, had QR code in 2 minutes. No stress.",
    image: '/profilepics/picture_man_06.png',
    theme: 'business',
  },
];

interface DestinationTestimonialsProps {
  destinationSlug: string;
  destinationName: string;
}

export function DestinationTestimonials({ destinationSlug, destinationName }: DestinationTestimonialsProps) {
  // Get testimonials for this destination first, then fill with others
  const destinationTestimonials = allTestimonials.filter(t => t.destination === destinationSlug);
  const otherTestimonials = allTestimonials.filter(t => t.destination !== destinationSlug && t.destination !== 'multi');
  const multiCountryTestimonials = allTestimonials.filter(t => t.destination === 'multi');

  // Prioritize: destination-specific → multi-country → others
  // Show 3 testimonials total
  let selectedTestimonials = [...destinationTestimonials];

  if (selectedTestimonials.length < 3) {
    // Add multi-country testimonials next
    const remaining = 3 - selectedTestimonials.length;
    selectedTestimonials = [
      ...selectedTestimonials,
      ...multiCountryTestimonials.slice(0, remaining),
    ];
  }

  if (selectedTestimonials.length < 3) {
    // Fill with others, shuffled for variety
    const remaining = 3 - selectedTestimonials.length;
    const shuffled = [...otherTestimonials].sort(() => Math.random() - 0.5);
    selectedTestimonials = [
      ...selectedTestimonials,
      ...shuffled.slice(0, remaining),
    ];
  }

  return (
    <section className="py-16 bg-cream-50">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-xl font-bold text-navy-500 mb-3">
            Trusted by Travellers to {destinationName}
          </h2>
          <p className="text-body-lg text-navy-300 max-w-2xl mx-auto">
            Join thousands of Australians who stay connected with Trvel
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {selectedTestimonials.map((testimonial) => (
            <article key={testimonial.id}>
              <div className="relative h-full bg-white rounded-2xl border border-cream-200 shadow-soft p-6 transition-all duration-300 hover:shadow-soft-lg hover:border-brand-200">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4" aria-hidden="true">
                  <Quote className="w-6 h-6 text-brand-100" />
                </div>

                {/* Rating */}
                <div className="flex gap-0.5 mb-3" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent-500 text-accent-500" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-body text-navy-400 mb-5 leading-relaxed line-clamp-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-cream-100">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-cream-200 flex-shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-body font-semibold text-navy-500">
                      {testimonial.name}
                    </p>
                    <p className="text-body-sm text-navy-300">
                      {testimonial.location} → {testimonial.destinationDisplay}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Trust indicator */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-full border border-cream-200 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                  <Image src="/profilepics/picture_woman_05.png" alt="" width={32} height={32} className="object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                  <Image src="/profilepics/picture_man_07.png" alt="" width={32} height={32} className="object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                  <Image src="/profilepics/picture_woman_06.png" alt="" width={32} height={32} className="object-cover" />
                </div>
              </div>
              <span className="text-sm font-medium text-navy-500">50,000+ happy travellers</span>
            </div>
            <div className="h-4 w-px bg-cream-200" />
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
              <span className="text-sm font-medium text-navy-500">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
