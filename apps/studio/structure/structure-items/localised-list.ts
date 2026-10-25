import type {
  DocumentListBuilder,
  ListBuilder,
  StructureBuilder,
} from 'sanity/structure'
import { DEFAULT_LOCALE, Locale } from '@portfolio/types/base'

/**
 * Splits a document list into All / English / Italian.
 *
 * Documents created before translations existed have no `language` and are
 * English, so the default locale matches a missing field too.
 */

export interface StructureOptions {
  i18n?: boolean
}

const LOCALE_TITLES: Readonly<Record<Locale, string>> = {
  [Locale.English]: 'English',
  [Locale.Italian]: 'Italiano',
}

const localeFilter = (locale: Locale): string =>
  locale === DEFAULT_LOCALE
    ? `coalesce(language, "${DEFAULT_LOCALE}") == "${locale}"`
    : `language == "${locale}"`

interface LocalisedListOptions {
  id: string
  title: string
  /** GROQ filter selecting the documents, without any language condition. */
  filter: string
  params?: Record<string, unknown>
  /**
   * The list's single document type, when it has one. Lets each language's
   * "+" button create a document in that language — through the plugin's
   * `<type>-<locale>` template — instead of the type's default (English) one.
   */
  schemaType?: string
  /** Applied to every generated list, e.g. to set a custom `.child()`. */
  configure?: (list: DocumentListBuilder) => DocumentListBuilder
}

export const localisedList = (
  S: StructureBuilder,
  {
    id,
    title,
    filter,
    params = {},
    schemaType,
    configure = list => list,
  }: LocalisedListOptions
): ListBuilder => {
  const documentList = (
    listTitle: string,
    listFilter: string,
    locale?: Locale
  ) => {
    const list = S.documentList()
      .title(listTitle)
      .filter(listFilter)
      .params(params)

    if (!schemaType) {
      return configure(list)
    }

    return configure(
      list
        .schemaType(schemaType)
        .initialValueTemplates(
          locale
            ? [S.initialValueTemplateItem(`${schemaType}-${locale}`)]
            : Object.values(Locale).map(templateLocale =>
                S.initialValueTemplateItem(`${schemaType}-${templateLocale}`)
              )
        )
    )
  }

  return S.list()
    .title(title)
    .items([
      S.listItem()
        .id(`${id}-all`)
        .title('All')
        .child(documentList(title, filter)),
      ...Object.values(Locale).map(locale =>
        S.listItem()
          .id(`${id}-${locale}`)
          .title(LOCALE_TITLES[locale])
          .child(
            documentList(
              `${title} — ${LOCALE_TITLES[locale]}`,
              `${filter} && ${localeFilter(locale)}`,
              locale
            )
          )
      ),
    ])
}
