import type {
  StructureBuilder,
  StructureResolverContext,
} from 'sanity/structure'
import HomepageItem from './structure-items/homepage'
import JournalItem from './structure-items/journal'
import PagesItem, { PAGE_STRUCTURE_TYPES } from './structure-items/pages'
import ProjectsItem from './structure-items/projects'
import SettingsItem from './structure-items/settings'
import { SINGLETON_TYPES } from '../constants'
import { PageTypeName, PluginDocumentType } from '@portfolio/types/base'
import type { StructureOptions } from './structure-items/localised-list'

const EXCLUDED_TYPES = new Set<string>([
  ...Array.from(SINGLETON_TYPES),
  ...Array.from(PAGE_STRUCTURE_TYPES),
  PageTypeName.ProjectPage as string,
  PageTypeName.ArticlePage as string,
  // Maintained by the translation plugin; editors never open these directly.
  PluginDocumentType.TranslationMetadata as string,
])

const structure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  options: StructureOptions = {}
) =>
  S.list()
    .title('Content')
    .items([
      SettingsItem(S),
      S.divider(),
      HomepageItem(S, options),
      PagesItem(S, context, options),
      S.divider(),
      ProjectsItem(S, options),
      JournalItem(S, options),
      ...S.documentTypeListItems().filter(
        item => !EXCLUDED_TYPES.has(String(item.getId()))
      ),
    ])

export default structure
