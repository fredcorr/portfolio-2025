import React from 'react'
import { NextIntlClientProvider, type Messages } from 'next-intl'
import { DEFAULT_LOCALE, Locale } from '@portfolio/types/base'

import en from '@/messages/en.json'
import it from '@/messages/it.json'
import { SITE_TIME_ZONE } from '@/i18n/config'

// `Messages` is typed from en.json's literal text, which it.json's strings can't
// match; messages/messages.test.ts is what guarantees the two share a shape.
const MESSAGES: Record<Locale, Messages> = {
  [Locale.English]: en,
  [Locale.Italian]: it as unknown as Messages,
}

/**
 * Wraps a tree in the provider the `[locale]` layout supplies at runtime, so
 * components using `useTranslations` render in tests. Unit tests run without
 * the `react-server` condition, so server components resolve to next-intl's
 * client build too and read from this provider.
 */
export const withIntl = (
  ui: React.ReactElement,
  locale: Locale = DEFAULT_LOCALE
) => (
  <NextIntlClientProvider
    locale={locale}
    messages={MESSAGES[locale]}
    timeZone={SITE_TIME_ZONE}
  >
    {ui}
  </NextIntlClientProvider>
)
