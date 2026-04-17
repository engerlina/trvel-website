import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

const LOCALES = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id', 'en-ca', 'en-nz'] as const;

const intlMiddleware = createMiddleware({
  locales: LOCALES as unknown as string[],
  defaultLocale: 'en-au',
  localeDetection: true,
});

export default function middleware(request: NextRequest) {
  // Expose the URL-based locale as a request header so the root layout can set
  // <html lang> server-side. Googlebot indexes the SSR response and cannot rely
  // on client-side effects to update the lang attribute.
  const pathname = request.nextUrl.pathname;
  const matched = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  const locale = matched || 'en-au';

  // Mutate request headers directly (propagates to server components in Next 14+)
  request.headers.set('x-locale', locale);

  const response = intlMiddleware(request);

  // Belt-and-suspenders: also use Next.js's documented x-middleware-override-headers
  // pattern so `headers()` in server components can read x-locale even if
  // direct mutation of request.headers is not honored by the runtime.
  const existingOverride = response.headers.get('x-middleware-override-headers');
  response.headers.set(
    'x-middleware-override-headers',
    existingOverride ? `${existingOverride},x-locale` : 'x-locale'
  );
  response.headers.set('x-middleware-request-x-locale', locale);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

