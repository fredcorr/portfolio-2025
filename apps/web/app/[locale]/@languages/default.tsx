import { isLocale, toCmsSlug } from '@portfolio/utils/locale'
import LanguagePicker from '@/components/molecules/LanguagePicker/LanguagePicker'
import { getLanguageOptions } from '@/utils/get-language-options'
import getPagePath from '@/utils/get-page-path'

interface LanguagesDefaultProps {
  params: Promise<{ locale: string }>
}

/**
 * Fallback for when Next cannot match the slot to the URL (a hard load of a
 * route it does not cover). Without translations every option is that
 * locale's homepage, which is always a valid destination.
 */
export default async function LanguagesDefault({
  params,
}: LanguagesDefaultProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return null
  }

  return (
    <LanguagePicker
      locale={locale}
      options={getLanguageOptions(
        locale,
        null,
        getPagePath({ slug: toCmsSlug(locale) })
      )}
    />
  )
}
