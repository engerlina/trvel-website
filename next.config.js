const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

module.exports = withNextIntl({
  // Limit concurrent static page generation to prevent DB connection exhaustion
  experimental: {
    // Reduce parallelism during build to prevent connection pool exhaustion
    workerThreads: false,
    cpus: 1,
  },
  // Increase timeout for static page generation to handle database queries
  // Longer timeout to account for queued operations due to semaphore
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'trvel-s3.s3.ap-southeast-2.amazonaws.com',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect non-www to www (except for API routes which need to work on both)
      {
        source: '/:path((?!api).*)',
        has: [
          {
            type: 'host',
            value: 'trvel.co',
          },
        ],
        destination: 'https://www.trvel.co/:path*',
        permanent: true,
      },
      // Redirect missing pages that were crawled
      {
        source: '/about',
        destination: '/en-au',
        permanent: true,
      },
      {
        source: '/:locale(en-au|en-sg|en-gb|en-us|ms-my|id-id)/about',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/refunds',
        destination: '/en-au/terms',
        permanent: true,
      },
      {
        source: '/:locale(en-au|en-sg|en-gb|en-us|ms-my|id-id)/refunds',
        destination: '/:locale/terms',
        permanent: true,
      },
      // Redirect malformed URLs
      {
        source: '/day',
        destination: '/en-au',
        permanent: true,
      },
      {
        source: '/hari',
        destination: '/id-id',
        permanent: true,
      },
      // Fix duplicate locale in URL
      {
        source: '/:locale(en-au|en-sg|en-gb|en-us|ms-my|id-id)/:locale2(en-au|en-sg|en-gb|en-us|ms-my|id-id)/:path*',
        destination: '/:locale/:path*',
        permanent: true,
      },
    ];
  },
});

