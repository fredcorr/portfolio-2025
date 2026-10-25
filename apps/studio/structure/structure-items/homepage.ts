import type { StructureBuilder } from 'sanity/structure'
import { Locale, PageTypeName } from '@portfolio/types/base'
import { LuHouse } from 'react-icons/lu'
import type { StructureOptions } from './localised-list'

/**
 * The English homepage is the singleton with the fixed id `homepage`. Other
 * languages are created from its Translations menu, which gives them
 * generated ids — so they are listed by query rather than addressed by id.
 */
const englishHomepage = (S: StructureBuilder) =>
  S.document()
    .schemaType(PageTypeName.HomePage)
    .documentId(PageTypeName.HomePage)

const HomepageItem = (S: StructureBuilder, { i18n }: StructureOptions = {}) =>
  S.listItem()
    .title('Homepage')
    .id(PageTypeName.HomePage)
    .icon(LuHouse)
    .child(
      i18n
        ? S.list()
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
        : englishHomepage(S)
    )

export default HomepageItem
