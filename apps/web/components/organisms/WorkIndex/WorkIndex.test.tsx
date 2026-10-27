import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import React from 'react'
import { ComponentTypeName, PageTypeName } from '@portfolio/types/base'
import type { WorkIndexComponent } from '@portfolio/types/components'
import WorkIndex from './WorkIndex'

const image = {
  _type: 'image' as const,
  asset: {
    url: '/test.jpg',
    metadata: { dimensions: { width: 800, height: 600 } },
  },
  alt: 'Test image',
}

const createWorkIndex = (
  overrides: Partial<WorkIndexComponent> = {}
): WorkIndexComponent => ({
  _type: ComponentTypeName.WorkIndex,
  _key: 'work-index',
  label: 'The Work',
  categoryLabel: 'Development',
  title: { heading: 'WORK', headingLevel: 1 },
  subtitle: 'Built sharp. Clean code. Zero compromise.',
  projects: [
    {
      _id: 'project-1',
      _type: PageTypeName.ProjectPage,
      clientName: 'Senta',
      title: 'Mobile App & Branding',
      slug: { _type: 'slug', current: 'projects/senta' },
      projectTags: [
        {
          _id: 'tag-1',
          _type: 'media.tag' as const,
          name: { _type: 'slug' as const, current: 'mobile-app' },
        },
      ],
      seoDescription: 'Habit tracking with zero friction.',
      year: 2025,
      projectHero: {
        _type: 'image',
        asset: { _type: 'reference', _ref: 'img-1', url: '/senta.jpg' },
        alt: 'Senta',
      },
    },
    {
      _id: 'project-2',
      _type: PageTypeName.ProjectPage,
      clientName: 'Crtly',
      title: 'Web App',
      slug: { _type: 'slug', current: 'projects/crtly' },
      projectTags: [
        {
          _id: 'tag-2',
          _type: 'media.tag' as const,
          name: { _type: 'slug' as const, current: 'web-app' },
        },
      ],
      seoDescription: 'Creator monetisation, stripped back.',
      year: 2024,
      projectHero: {
        _type: 'image',
        asset: { _type: 'reference', _ref: 'img-2', url: '/crtly.jpg' },
        alt: 'Crtly',
      },
    },
  ],
  ...overrides,
})

test('renders label and categoryLabel', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /The Work/)
  assert.match(markup, /Development/)
})

test('renders heading', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /WORK/)
})

test('renders subtitle', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /Built sharp/)
})

test('renders all project rows', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /Senta/)
  assert.match(markup, /Crtly/)
})

test('renders index badges for first and second project', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, />01</)
  assert.match(markup, />02</)
})

test('renders project links', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /href="projects\/senta"/)
})

test('renders project tags from name.current', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /Mobile App/)
  assert.match(markup, /Web App/)
})

test('renders project year', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex()} />)
  )
  assert.match(markup, /2025/)
})

test('renders empty state when no projects', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndex {...createWorkIndex({ projects: [] })} />)
  )
  assert.match(markup, /Projects will appear here once they are published/)
})
