import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Home, HelpCircle, Plane } from 'lucide-react';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-brand-50">
        <div className="min-h-screen flex flex-col">
          {/* Simple Header */}
          <header className="p-6">
            <Link href="/en-au" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Trvel"
                width={28}
                height={40}
                className="w-7 h-10"
              />
              <span className="text-xl font-bold text-navy-500">Trvel</span>
            </Link>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-lg w-full text-center">
              {/* Animated Plane Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center">
                  <Plane className="w-16 h-16 text-brand-500 transform -rotate-45" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-navy-100 rounded-full blur-sm opacity-50" />
              </div>

              {/* Error Message */}
              <h1 className="text-6xl md:text-7xl font-bold text-navy-600 mb-4">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-navy-500 mb-4">
                Looks like you&apos;re off the map
              </h2>
              <p className="text-lg text-navy-400 mb-8 max-w-md mx-auto">
                The page you&apos;re looking for has departed. Let&apos;s get you back on track to your next adventure.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/en-au"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
                <Link
                  href="/en-au/destinations"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl border-2 border-brand-400 hover:bg-brand-50 hover:border-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <MapPin className="w-5 h-5" />
                  Browse Destinations
                </Link>
              </div>

              {/* Help Link */}
              <p className="text-navy-400">
                Need assistance?{' '}
                <Link
                  href="/en-au/help"
                  className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </Link>
              </p>
            </div>
          </main>

          {/* Simple Footer */}
          <footer className="p-6 text-center text-sm text-navy-400">
            <p>&copy; {new Date().getFullYear()} Trvel. Stay connected, wherever you go.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
