import type { NavItemProps } from '@/components/molecules/NavItem/NavItem'
import { NavItemLayout } from '@/components/molecules/NavItem/NavItem'
import { PageTypeName } from '@portfolio/types/base'

export const navItemMock: NavItemProps = {
  item: {
    _id: 'projects-page',
    title: 'Projects',
    showInNavigation: true,
    isProjectsIndex: true,
    _type: PageTypeName.ProjectPage,
    slug: {
      _type: 'slug',
      current: '/projects',
    },
  },
  currentPath: '/projects',
  projectCount: 8,
  layout: NavItemLayout.Row,
  isOpen: true,
  index: 0,
}
