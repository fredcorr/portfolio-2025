import type {
  StructureBuilder,
  StructureResolverContext,
} from 'sanity/structure'
import { Locale, PageTypeName } from '@portfolio/types/base'
import { LuHouse } from 'react-icons/lu'
import { map, of, switchMap, type Observable } from 'rxjs'
import type { StructureOptions } from './localised-list'
import { StudioLocaleFilter, studioLocale$ } from '../studio-locale'

/**
 * The English homepage is the singleton with the fixed id `homepage`. Other
 * languages are created from its Translations menu, which gives them
 * generated ids — so the Italian one is found by query rather than by id.
 */
const englishHomepage = (S: StructureBuilder) =>
  S.document()
    .schemaType(PageTypeName.HomePage)
    .documentId(PageTypeName.HomePage)

const DRAFT_PREFIX = 'drafts.'

const italianHomepageId$ = (
  context: StructureResolverContext
): Observable<string | null> =>
  context.documentStore
    .listenQuery(
      '*[_type == $type && language == $language][0]._id',
      { type: PageTypeName.HomePage, language: Locale.Italian },
      {}
    )
    .pipe(
      map((id: unknown) =>
        typeof id === 'string' ? id.replace(DRAFT_PREFIX, '') : null
      )
    )

const italianHomepage = (
  S: StructureBuilder,
  context: StructureResolverContext
) =>
  italianHomepageId$(context).pipe(
    map(id =>
      id
        ? S.document().schemaType(PageTypeName.HomePage).documentId(id)
        : S.list()
            .title('Homepage — Italiano')
            .items([
              S.listItem()
                .id('homepage-it-missing')
                .title(
                  'No Italian homepage yet — open the English one and use Translations'
                )
                .child(englishHomepage(S)),
            ])
    )
  )

const allHomepages = (S: StructureBuilder) =>
  S.list()
    .title('Homepage')
    .items([
      S.listItem()
        .id(`${PageTypeName.HomePage}-${Locale.English}`)
        .title('English')
        .child(englishHomepage(S)),
      S.listItem()
        .id(`${PageTypeName.HomePage}-${Locale.Italian}`)
        .title('Italiano')
        .child(
          S.documentList()
            .title('Homepage — Italiano')
            .filter('_type == $type && language == $language')
            .params({
              type: PageTypeName.HomePage,
              language: Locale.Italian,
            })
        ),
    ])

const HomepageItem = (
  S: StructureBuilder,
  context: StructureResolverContext,
  { i18n }: StructureOptions = {}
) =>
  S.listItem()
    .title('Homepage')
    .id(PageTypeName.HomePage)
    .icon(LuHouse)
    .child(
      i18n
        ? () =>
            studioLocale$.pipe(
              switchMap(locale => {
                switch (locale) {
                  case StudioLocaleFilter.Italian:
                    return italianHomepage(S, context)
                  case StudioLocaleFilter.All:
                    return of(allHomepages(S))
                  default:
                    return of(englishHomepage(S))
                }
              })
            )
        : englishHomepage(S)
    )

export default HomepageItem
