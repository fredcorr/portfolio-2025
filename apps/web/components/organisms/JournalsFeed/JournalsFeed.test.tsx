import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import React from 'react'
import { ComponentTypeName, PageTypeName } from '@portfolio/types/base'
import type { JournalsFeedComponent } from '@portfolio/types/components'
import type { PortableTextBlock } from '@portabletext/react'
import JournalsFeed from './JournalsFeed'

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

const createJournalsFeed = (
  overrides: Partial<JournalsFeedComponent> = {}
): JournalsFeedComponent => ({
  _type: ComponentTypeName.JournalsFeed,
  _key: 'journals-feed',
  kicker: 'Journal',
  title: { heading: 'Notes from the workbench.', headingLevel: 2 },
  ctaLabel: 'Read all articles',
  ctaLink: { name: 'Read all articles', url: '/journal' },
  articles: [
    {
      _id: 'article-1',
      _type: PageTypeName.ArticlePage,
      title: 'On the discipline of restraint.',
      slug: { _type: 'slug', current: 'journal/restraint' },
      tags: ['Craft', 'Essay'],
      _createdAt: '2026-04-14T00:00:00.000Z',
      articleContent: block(
        'Most interfaces fail not because they do too little, but because they shout.'
      ),
    },
    {
      _id: 'article-2',
      _type: PageTypeName.ArticlePage,
      title: 'Designing for the second click.',
      slug: { _type: 'slug', current: 'journal/second-click' },
      tags: ['UX'],
      _createdAt: '2026-04-02T00:00:00.000Z',
    },
  ],
  ...overrides,
})

test('renders kicker, heading, and article titles', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /Journal/)
  assert.match(markup, /Notes from the workbench/)
  assert.match(markup, /On the discipline of restraint/)
  assert.match(markup, /Designing for the second click/)
})

test('renders article number badges', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /N° 001/)
  assert.match(markup, /N° 002/)
})

test('renders article tags', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /Craft · Essay/)
  assert.match(markup, /UX/)
})

test('renders article href from slug', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /href="\/journal\/restraint"/)
})

test('shows read time when articleContent is provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /min read/)
})

test('shows CTA when ctaLink has a href', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed()} />)
  )

  assert.match(markup, /Read all articles/)
  assert.match(markup, /href="\/journal"/)
})

test('hides CTA when ctaLink is absent', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <JournalsFeed
        {...createJournalsFeed({ ctaLink: undefined, ctaLabel: 'Read all' })}
      />
    )
  )

  assert.doesNotMatch(markup, /href="\/journal"/)
})

test('hides CTA when ctaLink has no resolvable href', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <JournalsFeed
        {...createJournalsFeed({
          ctaLink: { name: 'Broken' },
          ctaLabel: 'Read all',
        })}
      />
    )
  )

  assert.doesNotMatch(markup, /Read all/)
})

test('renders empty state when articles array is empty', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed({ articles: [] })} />)
  )

  assert.match(markup, /Articles will appear here once they are published/)
})

test('renders empty state when articles is undefined', () => {
  const markup = renderToStaticMarkup(
    withIntl(<JournalsFeed {...createJournalsFeed({ articles: undefined })} />)
  )

  assert.match(markup, /Articles will appear here once they are published/)
})
