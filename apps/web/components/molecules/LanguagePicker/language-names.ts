import { Locale } from '@portfolio/types/base'

/**
 * Each language's name in that language, as pickers conventionally show it.
 * Deliberately not in the message files: "Italiano" reads "Italiano" on every
 * page, whatever the page's own language.
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  [Locale.English]: 'English',
  [Locale.Italian]: 'Italiano',
}
