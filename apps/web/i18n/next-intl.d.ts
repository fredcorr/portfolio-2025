import type { Locale } from '@portfolio/types/base'
import type messages from '../messages/en.json'

// Types every `useTranslations` / `getTranslations` key and ICU argument
// against the English messages, and the locale against our enum.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
