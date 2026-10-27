import { DEFAULT_LOCALE, type Locale } from '@portfolio/types/base'
import type { PageTranslations } from '@portfolio/types/pages'
import type { SanitySlug } from '@portfolio/types/sanity'
import { isLocale } from '@portfolio/utils/locale'
import { buildPageUrl } from '@/utils/slug'

export const X_DEFAULT = 'x-default'

export interface HreflangSource {
  language?: Locale
  slug?: SanitySlug
  translations?: PageTranslations | null
}

/**
 * `hreflang` alternates for a page: one absolute URL per language version
 * that exists, keyed by locale, plus `x-default`.
 *
 * - The page itself is always listed, so a page with no translations still
 *   declares its own language (Google expects the set to be self-referencing).
 * - Versions come from the translation metadata, which only holds published
 *   documents with a slug — a missing language is simply absent, never a
 *   guessed URL.
 * - `x-default` points at the English version when there is one: unprefixed
 *   English is the site's default for visitors matching no listed language.
 *
 * Used by both `generateMetadata` and the sitemap, so the two always agree.
 */
export const getHreflangAlternates = (
  siteUrl: string,
  page: HreflangSource
): Record<string, string> => {
  const urls = new Map<Locale, string>()

  for (const item of page.translations?.items ?? []) {
    const slug = item.slug?.current

    if (slug && isLocale(item.language)) {
      urls.set(item.language, buildPageUrl(siteUrl, slug))
    }
  }

  const ownSlug = page.slug?.current

  if (ownSlug) {
    // Query data is untyped at runtime: anything but a supported locale is
    // treated as English, matching `LANGUAGE_FILTER`.
    const ownLocale = isLocale(page.language) ? page.language : DEFAULT_LOCALE
    urls.set(ownLocale, buildPageUrl(siteUrl, ownSlug))
  }

  const alternates: Record<string, string> = Object.fromEntries(urls)
  const defaultUrl = urls.get(DEFAULT_LOCALE)

  if (defaultUrl) {
    alternates[X_DEFAULT] = defaultUrl
  }

  return alternates
}
