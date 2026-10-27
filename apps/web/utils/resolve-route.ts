import { DEFAULT_LOCALE, type Locale } from '@portfolio/types/base'
import type { CmsPages } from '@portfolio/types/pages'
import { fromCmsSlug, isLocale, toCmsSlug } from '@portfolio/utils/locale'
import { locale as rootLocale } from 'next/root-params'
import { client } from '@/sanity/client'
import { ALL_PAGES_QUERY } from '@/sanity/queries/base'

/**
 * Shared by every route under `app/[locale]` that renders from a page
 * document: the page itself and the `@languages` slot, which must resolve the
 * same URL to the same document.
 */

export interface PageRouteParams {
  locale: string
  slug?: string[]
}

export interface ResolvedRoute {
  locale: Locale
  /** The stored `slug.current`: the locale prefix plus the path segments. */
  slug: string
}

/**
 * The route receives the locale and the path separately; Sanity stores them
 * joined (`it/journals/foo`). An unknown locale cannot reach here through the
 * proxy, but resolves to `null` so callers 404 instead of guessing.
 */
export const resolveRoute = async (
  params: Promise<PageRouteParams>
): Promise<ResolvedRoute | null> => {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return null
  }

  return { locale, slug: toCmsSlug(locale, slug ?? []) }
}

/**
 * A document only belongs to the locale its `language` says (missing means
 * English, for documents from before translations existed). Slugs already
 * carry the prefix, so a mismatch means a stale or hand-edited slug — serve a
 * 404 rather than an English page under `/it`.
 */
export const belongsToLocale = (page: CmsPages, locale: Locale) =>
  (page.language ?? DEFAULT_LOCALE) === locale

// Deliberately unguarded. Cache Components requires at least one param, so the
// old `catch → return []` is no longer legal. Letting the error propagate is
// also the better behaviour: swallowing it produced a green build that deployed
// a site with zero prerendered pages, which is worse than a loud failure.
//
// `locale` is a root param, so this runs once per locale and reads it from
// `next/root-params`. A locale with no published pages yet would return an
// empty list, which Cache Components rejects; its homepage is listed instead
// and renders a 404 until one is published.
export async function getLocalePageParams() {
  const locale = await rootLocale()
  const pages = await client.fetch<CmsPages[]>(ALL_PAGES_QUERY, { locale })

  const params = pages
    .map(page => page.slug?.current)
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => ({ slug: fromCmsSlug(slug).segments }))

  return params.length > 0 ? params : [{ slug: [] }]
}
