'use client'

import { useParams } from 'next/navigation'
import { DEFAULT_LOCALE, Locale } from '@portfolio/types/base'
import { isLocale } from '@portfolio/utils/locale'
import { Heading } from '@/components/atoms/Heading/Heading'

/**
 * Replaces the root layout when it fails, so neither the layout's `lang` nor
 * next-intl's provider exist here. The two strings are kept local, and the
 * locale comes from the URL's `[locale]` param when there is one.
 */
const COPY: Record<Locale, { title: string; retry: string }> = {
  [Locale.English]: { title: 'Something went wrong!', retry: 'Try again' },
  [Locale.Italian]: { title: 'Qualcosa è andato storto!', retry: 'Riprova' },
}

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale?: string }>()
  const locale = isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE
  const copy = COPY[locale]

  return (
    <html lang={locale}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 py-12 text-center text-neutral-800">
          <Heading level={2} className="text-3xl font-semibold sm:text-4xl">
            {copy.title}
          </Heading>
          <button
            onClick={() => reset()}
            className="bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700 transition-colors"
          >
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
