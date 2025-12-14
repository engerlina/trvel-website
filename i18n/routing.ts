import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en-au', 'en-sg', 'en-gb', 'ms-my', 'id-id'],
  defaultLocale: 'en-au',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

