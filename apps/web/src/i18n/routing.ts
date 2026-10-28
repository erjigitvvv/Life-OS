import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['uz', 'en', 'ru'],
  defaultLocale: 'uz',
  localePrefix: 'always'
});
