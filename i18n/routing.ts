import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id', 'en-ca', 'en-nz'],
  defaultLocale: 'en-au',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

