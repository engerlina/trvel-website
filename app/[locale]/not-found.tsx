import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { MapPin, Home, HelpCircle, Plane, Search } from 'lucide-react';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Page Not Found | Trvel',
  description: 'The page you are looking for could not be found. Browse our eSIM destinations or return home.',
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-cream-50 via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center py-12 md:py-20">
            {/* Animated Illustration */}
            <div className="relative mb-10">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Globe pattern background */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-400" />
                    <ellipse cx="50" cy="50" rx="40" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-400" />
                    <ellipse cx="50" cy="50" rx="20" ry="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-400" />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-brand-400" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-brand-400" />
                  </svg>
                </div>
                <Plane className="w-20 h-20 text-brand-500 transform -rotate-45 relative z-10" />
              </div>
              {/* Shadow */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-navy-100 rounded-full blur-md opacity-40" />
            </div>

            {/* Error Code */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full mb-6">
              <Search className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-medium text-brand-600">Error 404</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-navy-600 mb-4">
              Destination not found
            </h1>

            <p className="text-lg md:text-xl text-navy-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Looks like this page has taken off without us. Don&apos;t worry, we&apos;ll help you find your way back.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <Home className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/destinations">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <MapPin className="w-5 h-5" />
                  Browse Destinations
                </Button>
              </Link>
            </div>

            {/* Helpful Links */}
            <div className="border-t border-cream-200 pt-8">
              <p className="text-sm text-navy-400 mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/get-started"
                  className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  Get Started
                </Link>
                <span className="text-cream-300">|</span>
                <Link
                  href="/how-it-works"
                  className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  How It Works
                </Link>
                <span className="text-cream-300">|</span>
                <Link
                  href="/compatibility"
                  className="text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  Check Compatibility
                </Link>
                <span className="text-cream-300">|</span>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Get Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
