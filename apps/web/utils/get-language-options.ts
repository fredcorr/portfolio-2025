import { SUPPORTED_LOCALES, type Locale } from '@portfolio/types/base'
import type { PageTranslations } from '@portfolio/types/pages'
import { isLocale, toCmsSlug } from '@portfolio/utils/locale'
import getPagePath from '@/utils/get-page-path'

export interface LanguageOption {
  locale: Locale
  /** Site-relative URL to switch to. */
  href: string
  isCurrent: boolean
  /**
   * Whether this page exists in `locale`. When it doesn't, `href` is that
   * locale's homepage instead, so the option never leads to a 404.
   */
  isAvailable: boolean
}

/**
 * One entry per supported locale for the language picker, in a fixed order.
 *
 * The current locale links to the page itself; any other links to the
 * page's published translation when there is one, otherwise to that
 * locale's homepage, flagged `isAvailable: false` so the picker can say so.
 * Pure, so the picker component only renders.
 */
export const getLanguageOptions = (
  locale: Locale,
  translations: PageTranslations | null | undefined,
  currentPath: string
): LanguageOption[] => {
  const versions = new Map<Locale, string>()

  for (const item of translations?.items ?? []) {
    const slug = item.slug?.current

    if (slug && isLocale(item.language)) {
      versions.set(item.language, getPagePath({ slug }))
    }
  }

  return SUPPORTED_LOCALES.map(option => {
    if (option === locale) {
      return {
        locale: option,
        href: currentPath,
        isCurrent: true,
        isAvailable: true,
      }
    }

    const translated = versions.get(option)

    return {
      locale: option,
      href: translated ?? getPagePath({ slug: toCmsSlug(option) }),
      isCurrent: false,
      isAvailable: Boolean(translated),
    }
  })
}
