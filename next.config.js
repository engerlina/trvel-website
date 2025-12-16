const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

module.exports = withNextIntl({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
});

