'use client';

import { useEffect } from 'react';
import { RefreshCw, Home, AlertOctagon } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-lg w-full text-center">
            {/* Critical Error Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertOctagon className="w-16 h-16 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Critical Error
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-md mx-auto">
              Something unexpected happened. We&apos;re sorry for the inconvenience. Please try refreshing the page.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-left">
                <p className="text-sm font-mono text-red-300 break-all">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <a
                href="/en-au"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </a>
            </div>

            {/* Footer */}
            <p className="mt-12 text-sm text-slate-500">
              If this problem persists, please contact{' '}
              <a href="mailto:support@trvel.co" className="text-slate-400 hover:text-white transition-colors">
                support@trvel.co
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
