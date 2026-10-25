import type { StructureBuilder } from 'sanity/structure'
import { PageTypeName } from '@portfolio/types/base'
import { LuBriefcase } from 'react-icons/lu'
import { localisedList, type StructureOptions } from './localised-list'

const ProjectsItem = (S: StructureBuilder, { i18n }: StructureOptions = {}) =>
  S.listItem()
    .title('Projects')
    .id(PageTypeName.ProjectPage)
    .icon(LuBriefcase)
    .child(
      i18n
        ? localisedList(S, {
            id: PageTypeName.ProjectPage,
            title: 'Projects',
            filter: `_type == "${PageTypeName.ProjectPage}"`,
            schemaType: PageTypeName.ProjectPage,
          })
        : S.documentTypeList(PageTypeName.ProjectPage).title('Projects')
    )

export default ProjectsItem
