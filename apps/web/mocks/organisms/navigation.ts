import type { NavigationData } from '@portfolio/types/components'

export const navigationMock: NavigationData = {
  items: [
    {
      _id: 'home-page',
      title: 'Home',
      slug: {
        _type: 'slug',
        current: '/',
      },
    },
    {
      _id: 'projects-page',
      title: 'Projects',
      isProjectsIndex: true,
      slug: {
        _type: 'slug',
        current: '/projects',
      },
    },
    {
      _id: 'contact-page',
      title: 'Contact',
      slug: {
        _type: 'slug',
        current: '/contact',
      },
    },
    {
      _id: 'about-page',
      title: 'About',
      slug: {
        _type: 'slug',
        current: '/about',
      },
    },
  ],
  projectCount: 8,
}
