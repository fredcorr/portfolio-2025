import { Locale } from '@portfolio/types/base'

export interface LanguagePickerStrings {
  triggerPrefix: string
  toolbarLabel: string
  readIn: string
  close: string
  current: string
  homepageFallback: string
}

/**
 * The picker's own chrome, in the language of the page it sits on. Local until
 * the site-wide UI dictionary exists.
 */
export const LANGUAGE_PICKER_STRINGS: Record<Locale, LanguagePickerStrings> = {
  [Locale.English]: {
    triggerPrefix: 'Language: ',
    toolbarLabel: 'Choose language',
    readIn: 'Read in',
    close: 'Close language picker',
    current: 'current',
    homepageFallback: "this page isn't translated, opens the homepage",
  },
  [Locale.Italian]: {
    triggerPrefix: 'Lingua: ',
    toolbarLabel: 'Scegli la lingua',
    readIn: 'Leggi in',
    close: 'Chiudi selettore lingua',
    current: 'attuale',
    homepageFallback: 'pagina non tradotta, apre la homepage',
  },
}

/** Each language's name in that language, as pickers conventionally show it. */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  [Locale.English]: 'English',
  [Locale.Italian]: 'Italiano',
}
