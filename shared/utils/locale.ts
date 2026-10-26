import {
  DEFAULT_LOCALE,
  Locale,
  SUPPORTED_LOCALES,
} from "@portfolio/types/base";

/**
 * Locale ↔ slug helpers.
 *
 * Sanity stores the full path in `slug.current`, with the locale prefix baked
 * in for every non-default locale (`it/journals/foo`), while the default
 * locale is unprefixed (`journals/foo`) and its homepage is `/`. The web route
 * receives the same path split in two — `locale: 'it'` and
 * `slug: ['journals', 'foo']` — so these two functions are the single place
 * that joins and splits them. Keeping the edge cases (homepage `/` vs `it`,
 * no prefix for the default) here stops the route, `generateStaticParams`,
 * the proxy and Studio validation from each handling them slightly
 * differently.
 */

const HOMEPAGE_SLUG = "/";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" &&
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

/** The URL/slug prefix for a locale: empty for the default locale. */
export const localePrefix = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? "" : locale;

/**
 * Joins a locale and its path segments into the `slug.current` Sanity stores.
 *
 *   toCmsSlug('en', [])                  → '/'
 *   toCmsSlug('en', ['journals', 'foo']) → 'journals/foo'
 *   toCmsSlug('it', [])                  → 'it'
 *   toCmsSlug('it', ['journals', 'foo']) → 'it/journals/foo'
 */
export const toCmsSlug = (
  locale: Locale,
  segments: readonly string[] = [],
): string => {
  const path = [localePrefix(locale), ...segments].filter(Boolean).join("/");

  return path || HOMEPAGE_SLUG;
};

export interface ParsedCmsSlug {
  locale: Locale;
  segments: string[];
}

/**
 * Splits a stored `slug.current` back into its locale and path segments —
 * the inverse of `toCmsSlug`. A slug whose first segment is not a
 * non-default locale belongs to the default locale.
 *
 *   fromCmsSlug('/')               → { locale: 'en', segments: [] }
 *   fromCmsSlug('journals/foo')    → { locale: 'en', segments: ['journals', 'foo'] }
 *   fromCmsSlug('it')              → { locale: 'it', segments: [] }
 *   fromCmsSlug('it/journals/foo') → { locale: 'it', segments: ['journals', 'foo'] }
 */
export const fromCmsSlug = (slug: string): ParsedCmsSlug => {
  const [first, ...rest] = slug.split("/").filter(Boolean);

  if (first !== undefined && first !== DEFAULT_LOCALE && isLocale(first)) {
    return { locale: first, segments: rest };
  }

  return {
    locale: DEFAULT_LOCALE,
    segments: first === undefined ? [] : [first, ...rest],
  };
};

/**
 * Re-homes a stored slug into another locale, keeping its path.
 *
 *   localiseSlug('journals/foo', 'it')    → 'it/journals/foo'
 *   localiseSlug('/', 'it')               → 'it'
 *   localiseSlug('it/journals/foo', 'en') → 'journals/foo'
 *
 * Used when the Studio creates a translation (which copies the source's
 * slug) and when it generates a slug for a document in a given locale.
 */
export const localiseSlug = (slug: string, locale: Locale): string =>
  toCmsSlug(locale, fromCmsSlug(slug).segments);

/** Whether a stored slug carries the prefix its document's locale requires. */
export const slugMatchesLocale = (slug: string, locale: Locale): boolean =>
  fromCmsSlug(slug).locale === locale;
