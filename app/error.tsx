'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, Home, HelpCircle, AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-amber-50">
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
              {/* Warning Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-amber-500" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-navy-100 rounded-full blur-sm opacity-50" />
              </div>

              {/* Error Message */}
              <h1 className="text-3xl md:text-4xl font-bold text-navy-600 mb-4">
                Something went wrong
              </h1>
              <p className="text-lg text-navy-400 mb-8 max-w-md mx-auto">
                We hit some turbulence. Don&apos;t worry, our team has been notified and we&apos;re working on it.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <p className="text-sm font-mono text-red-600 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-400 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 via-accent-600 to-accent-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <Link
                  href="/en-au"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl border-2 border-brand-400 hover:bg-brand-50 hover:border-brand-500 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
              </div>

              {/* Help Link */}
              <p className="text-navy-400">
                Still having issues?{' '}
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
