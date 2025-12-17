import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'],
  defaultLocale: 'en-au',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

