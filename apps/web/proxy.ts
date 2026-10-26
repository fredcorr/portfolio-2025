import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, Locale } from '@portfolio/types/base'

/**
 * Locale routing.
 *
 * Every page lives under `app/[locale]`, but English is served without a
 * prefix: `/journals/foo` is English, `/it/journals/foo` is Italian. This maps
 * public URLs onto that tree:
 *
 * - `/it`, `/it/…` (any non-default locale) pass straight through.
 * - `/en`, `/en/…` redirect (308) to the unprefixed URL, so English content
 *   has exactly one canonical address.
 * - Everything else is rewritten — not redirected — to `/en/…`, so English
 *   URLs stay exactly as they were.
 *
 * Kept free of shared runtime modules beyond the locale enum: Proxy runs
 * separately from render code (see the Next.js proxy docs).
 */

const NON_DEFAULT_LOCALES: readonly string[] = Object.values(Locale).filter(
  locale => locale !== DEFAULT_LOCALE
)

const firstSegment = (pathname: string) => pathname.split('/')[1] ?? ''

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segment = firstSegment(pathname)

  if (NON_DEFAULT_LOCALES.includes(segment)) {
    return NextResponse.next()
  }

  if (segment === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(`/${DEFAULT_LOCALE}`.length) || '/'
    return NextResponse.redirect(url, 308)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Everything except API routes, Next internals and root-level metadata and
  // static files, which live outside `[locale]`. Values must be literals for
  // Next to analyse them at build time.
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|sitemap\\.xml|robots\\.txt|llms\\.txt|icon\\.svg|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
