import type {
  DocumentListBuilder,
  StructureBuilder,
  StructureResolverContext,
} from 'sanity/structure'
import { PageTypeName } from '@portfolio/types/base'
import { LuLayers } from 'react-icons/lu'
import { firstValueFrom } from 'rxjs'
import { localisedList, type StructureOptions } from './localised-list'

export const PAGE_STRUCTURE_TYPES = new Set<string>([
  PageTypeName.Page as string,
  PageTypeName.AboutPage as string,
  PageTypeName.ContactPage as string,
])

const PagesItem = (
  S: StructureBuilder,
  context: StructureResolverContext,
  { i18n }: StructureOptions = {}
) => {
  const types = Array.from(PAGE_STRUCTURE_TYPES)

  // Pages mixes three document types, so each opened item resolves its own.
  const withDocumentChild = (list: DocumentListBuilder) =>
    list.child(async documentId => {
      try {
        const schemaType = await firstValueFrom(
          context.documentStore.resolveTypeForDocument(documentId)
        )

        return S.document().schemaType(schemaType).documentId(documentId)
      } catch {
        return S.document().schemaType(PageTypeName.Page).documentId(documentId)
      }
    })

  return S.listItem()
    .title('Pages')
    .id('pages')
    .icon(LuLayers)
    .child(
      i18n
        ? localisedList(S, {
            id: 'pages',
            title: 'Pages',
            filter: '_type in $types',
            params: { types },
            configure: withDocumentChild,
          })
        : withDocumentChild(
            S.documentList()
              .title('Pages')
              .filter('_type in $types')
              .params({ types })
          )
    )
}

export default PagesItem
