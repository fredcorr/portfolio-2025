import { draftMode } from 'next/headers'
import LanguagePicker from '@/components/molecules/LanguagePicker/LanguagePicker'
import { getLanguageOptions } from '@/utils/get-language-options'
import getPage from '@/utils/get-page'
import getPagePath from '@/utils/get-page-path'
import {
  belongsToLocale,
  getLocalePageParams,
  resolveRoute,
  type PageRouteParams,
} from '@/utils/resolve-route'

interface LanguagesSlotProps {
  params: Promise<PageRouteParams>
}

/**
 * The language picker for the current page, rendered into the layout's nav.
 *
 * A layout never sees page data, so the picker gets its own slot matching
 * every URL the page does. `getPage` is `'use cache'`, so this reads the same
 * cache entry as the page — no second fetch and no separate invalidation. A
 * URL with no page (a 404) still gets a picker, pointing at the homepages.
 */
export default async function LanguagesSlot({ params }: LanguagesSlotProps) {
  const route = await resolveRoute(params)

  if (!route) {
    return null
  }

  const { locale, slug } = route
  const { isEnabled: isDraft } = await draftMode()
  const page = await getPage(slug, locale, isDraft)
  const translations =
    page && belongsToLocale(page, locale) ? page.translations : null

  return (
    <LanguagePicker
      locale={locale}
      options={getLanguageOptions(locale, translations, getPagePath({ slug }))}
    />
  )
}

// Slots at one level must prerender together with the page, so this lists
// the same params.
export const generateStaticParams = getLocalePageParams
