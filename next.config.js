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
  staticPageGenerationTimeout: 120,
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
    ];
  },
});

