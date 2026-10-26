import type { DocumentListBuilder, StructureBuilder } from 'sanity/structure'
import type { Observable } from 'rxjs'
import { map } from 'rxjs'
import {
  STUDIO_LOCALE_TITLES,
  StudioLocaleFilter,
  studioLocale$,
  withLocaleCondition,
} from '../studio-locale'

export interface StructureOptions {
  i18n?: boolean
}

interface LocaleFilteredListOptions {
  title: string
  /** GROQ filter selecting the documents, without any language condition. */
  filter: string
  params?: Record<string, unknown>
  schemaType?: string
  /** Applied to the generated list, e.g. to set a custom `.child()`. */
  configure?: (list: DocumentListBuilder) => DocumentListBuilder
}

const paneTitle = (title: string, locale: StudioLocaleFilter) =>
  locale === StudioLocaleFilter.All
    ? title
    : `${title} — ${STUDIO_LOCALE_TITLES[locale]}`

/**
 * A document list filtered by the navbar's content-language switch.
 *
 * Returned as an observable so an open list re-renders when the switch
 * changes. A new document has no language until one is chosen from its
 * Translations menu, and until then it counts as English — so under Italiano
 * it appears only once its language is set.
 */
export const localeFilteredList = (
  S: StructureBuilder,
  {
    title,
    filter,
    params = {},
    schemaType,
    configure = list => list,
  }: LocaleFilteredListOptions
): Observable<DocumentListBuilder> =>
  studioLocale$.pipe(
    map(locale => {
      const list = S.documentList()
        .title(paneTitle(title, locale))
        .filter(withLocaleCondition(filter, locale))
        .params(params)

      return configure(schemaType ? list.schemaType(schemaType) : list)
    })
  )
