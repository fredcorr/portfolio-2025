import type { StructureBuilder } from 'sanity/structure'
import { PageTypeName } from '@portfolio/types/base'
import { LuBookOpen } from 'react-icons/lu'
import { localisedList, type StructureOptions } from './localised-list'

const JournalItem = (S: StructureBuilder, { i18n }: StructureOptions = {}) =>
  S.listItem()
    .title('Journal')
    .id(PageTypeName.ArticlePage)
    .icon(LuBookOpen)
    .child(
      i18n
        ? localisedList(S, {
            id: PageTypeName.ArticlePage,
            title: 'Journal',
            filter: `_type == "${PageTypeName.ArticlePage}"`,
            schemaType: PageTypeName.ArticlePage,
          })
        : S.documentTypeList(PageTypeName.ArticlePage).title('Journal')
    )

export default JournalItem
