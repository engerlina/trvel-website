'use client';

import { useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { RefreshCw, Home, HelpCircle, AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

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
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-cream-50 via-white to-amber-50">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center py-12 md:py-20">
            {/* Warning Illustration */}
            <div className="relative mb-10">
              <div className="w-40 h-40 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Radar pattern background */}
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
                  </svg>
                </div>
                <AlertTriangle className="w-20 h-20 text-amber-500 relative z-10" />
              </div>
              {/* Shadow */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-navy-100 rounded-full blur-md opacity-40" />
            </div>

            {/* Error Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-amber-700">Technical Issue</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-navy-600 mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-lg md:text-xl text-navy-400 mb-8 max-w-lg mx-auto leading-relaxed">
              We encountered some unexpected turbulence. Our team has been alerted and is working to fix this.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-left max-w-md mx-auto">
                <p className="text-xs font-semibold text-red-600 mb-1">Error Details:</p>
                <p className="text-sm font-mono text-red-500 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-400 mt-2">
                    Reference: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="primary" size="lg" onClick={reset} className="w-full sm:w-auto">
                <RefreshCw className="w-5 h-5" />
                Try Again
              </Button>
              <Link href="/">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Home className="w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Support Section */}
            <div className="border-t border-cream-200 pt-8">
              <p className="text-sm text-navy-400 mb-4">Need immediate assistance?</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </Link>
                <a
                  href="mailto:support@trvel.co"
                  className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
