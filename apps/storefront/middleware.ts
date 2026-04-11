import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'en', 'ja', 'zh', 'es'],

  // Used when no locale matches
  defaultLocale: 'ko',
  
  // Optional: Automatically redirect to locale prefix (default is always)
  localePrefix: 'always'
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This matches the root `/` and any `/path/to/page` that doesn't start with
  // `/_next`, `/api`, `/favicon.ico` or matches static files.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
