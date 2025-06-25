import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fi', 'en'],
  defaultLocale: 'fi'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};