import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import React from 'react'
import { ComponentTypeName, Locale, PageTypeName } from '@portfolio/types/base'
import type { ProjectListingComponent } from '@portfolio/types/components'
import type { PortableTextBlock } from '@portabletext/react'
import ProjectListing from './ProjectListing'

const block = (text: string): PortableTextBlock[] => [
  {
    _key: `${text}-block`,
    _type: 'block',
    children: [
      {
        _key: `${text}-span`,
        _type: 'span',
        text,
        marks: [],
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]

const createProjectListing = (
  overrides: Partial<ProjectListingComponent> = {}
): ProjectListingComponent => ({
  _type: ComponentTypeName.ProjectListing,
  _key: 'project-listing',
  projectsIndexSlug: 'projects',
  title: { heading: 'Featured work', headingLevel: 2 },
  subtitle: block('High-performing product design with brand craft.'),
  projects: [
    {
      _id: 'project-1',
      _type: PageTypeName.ProjectPage,
      clientName: 'Senta',
      title: 'Mobile App & Branding',
      slug: { _type: 'slug', current: 'projects/senta' },
      projectHero: {
        _type: 'image',
        alt: 'Senta mobile app UI',
        asset: {
          _type: 'reference',
          _ref: 'image-senta',
          url: '/senta.jpg',
        },
      },
    },
    {
      _id: 'project-2',
      _type: PageTypeName.ProjectPage,
      clientName: 'Crtly',
      title: 'Mobile App',
      slug: { _type: 'slug', current: 'projects/crtly' },
      projectHero: {
        _type: 'image',
        alt: 'Crtly mobile app UI',
        asset: {
          _type: 'reference',
          _ref: 'image-crtly',
          url: '/crtly.jpg',
        },
      },
    },
  ],
  ...overrides,
})

test('renders heading, subtitle, and project cards', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ProjectListing {...createProjectListing()} />)
  )

  assert.match(markup, /Featured work/)
  assert.match(markup, /High-performing product design with brand craft/)
  assert.match(markup, /Senta/)
  assert.match(markup, /Crtly/)
  assert.match(markup, /href="projects\/senta"/)
})

test('renders index badge on first card', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ProjectListing {...createProjectListing()} />)
  )

  assert.match(markup, />01</)
})

test('second card has staggered offset class', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ProjectListing {...createProjectListing()} />)
  )

  assert.match(markup, /md:mt-16/)
})

test('shows More CTA when enabled', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ProjectListing {...createProjectListing({ showCtaToProjects: true })} />
    )
  )

  assert.match(markup, /More/)
  assert.match(markup, /href="\/projects"/)
})

test('does not show CTA when disabled', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ProjectListing {...createProjectListing({ showCtaToProjects: false })} />
    )
  )

  assert.doesNotMatch(markup, /href="\/projects"/)
})

test('renders empty state when there are no projects', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ProjectListing
        {...createProjectListing({
          projects: [],
          subtitle: block('Coming soon'),
        })}
      />
    )
  )

  assert.match(markup, /Projects will appear here once they are published/)
})

test('cards use square image, shadow, and above-image badge classes', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ProjectListing {...createProjectListing()} />)
  )

  assert.match(markup, /aspect-square/)
  assert.match(markup, /mix-blend-difference/)
  assert.match(
    markup,
    /shadow-\[16px_16px_36px_4px_rgba\(128,128,128,0\.54\)\]/
  )
})

test('More links to the projects index slug for the page language', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ProjectListing
        {...createProjectListing({
          showCtaToProjects: true,
          projectsIndexSlug: 'it/progetti',
        })}
      />,
      Locale.Italian
    )
  )

  assert.match(markup, /href="\/it\/progetti"/)
  assert.doesNotMatch(markup, /href="\/it\/projects"/)
  assert.match(markup, />Altro</)
})

test('hides More when the locale has no projects index yet', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ProjectListing
        {...createProjectListing({
          showCtaToProjects: true,
          projectsIndexSlug: null,
        })}
      />,
      Locale.Italian
    )
  )

  assert.doesNotMatch(markup, />Altro</)
})
