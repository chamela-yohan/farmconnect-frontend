import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // The languages we support
  locales: ['en', 'si', 'ta'],
  // The default language if the user visits '/'
  defaultLocale: 'en' 
});