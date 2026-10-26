import { BehaviorSubject } from 'rxjs'
import { DEFAULT_LOCALE, Locale } from '@portfolio/types/base'

/**
 * The language the Studio's document lists are filtered to, set from the
 * switch in the navbar and shared by every list in the structure.
 *
 * An observable rather than React state because the structure is not a React
 * tree: list panes subscribe to it, so changing the switch re-renders open
 * lists in place without a reload.
 */

export enum StudioLocaleFilter {
  English = Locale.English,
  Italian = Locale.Italian,
  All = 'all',
}

export const STUDIO_LOCALE_TITLES: Readonly<
  Record<StudioLocaleFilter, string>
> = {
  [StudioLocaleFilter.English]: 'English',
  [StudioLocaleFilter.Italian]: 'Italiano',
  [StudioLocaleFilter.All]: 'All languages',
}

const STORAGE_KEY = 'portfolio.studioLocale'
const DEFAULT_FILTER = StudioLocaleFilter.English

const isStudioLocaleFilter = (value: unknown): value is StudioLocaleFilter =>
  Object.values(StudioLocaleFilter).some(filter => filter === value)

// Storage can be unavailable (private mode, blocked site data); the filter
// then simply resets to English on every load.
const readStoredFilter = (): StudioLocaleFilter => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isStudioLocaleFilter(stored) ? stored : DEFAULT_FILTER
  } catch {
    return DEFAULT_FILTER
  }
}

const filterSubject = new BehaviorSubject<StudioLocaleFilter>(
  typeof window === 'undefined' ? DEFAULT_FILTER : readStoredFilter()
)

export const studioLocale$ = filterSubject.asObservable()

export const getStudioLocale = (): StudioLocaleFilter => filterSubject.value

export const setStudioLocale = (filter: StudioLocaleFilter): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, filter)
  } catch {
    // Not persisted; the in-memory value still applies for this session.
  }

  filterSubject.next(filter)
}

/**
 * GROQ condition for a filter, to append to a list's own filter with `&&`.
 * Documents without a `language` predate translations and are English.
 */
export const localeCondition = (filter: StudioLocaleFilter): string | null => {
  switch (filter) {
    case StudioLocaleFilter.All:
      return null
    case StudioLocaleFilter.English:
      return `coalesce(language, "${DEFAULT_LOCALE}") == "${Locale.English}"`
    default:
      return `language == "${filter}"`
  }
}

export const withLocaleCondition = (
  filter: string,
  locale: StudioLocaleFilter
): string => {
  const condition = localeCondition(locale)
  return condition ? `${filter} && ${condition}` : filter
}
