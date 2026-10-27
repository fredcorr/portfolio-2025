import { getRequestConfig } from 'next-intl/server'
import { locale as rootLocale } from 'next/root-params'
import { DEFAULT_LOCALE } from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'
import { SITE_TIME_ZONE } from './config'

/**
 * next-intl handles system text and formatting only — routing stays with
 * `proxy.ts` and the `[locale]` segment. The locale is that segment, read as a
 * root param, which works inside Cache Components where request headers can't
 * be read. A request outside `[locale]` (a root-level route) falls back to the
 * default rather than throwing.
 */
export default getRequestConfig(async () => {
  const requested = await rootLocale()
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE

  return {
    locale,
    timeZone: SITE_TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
