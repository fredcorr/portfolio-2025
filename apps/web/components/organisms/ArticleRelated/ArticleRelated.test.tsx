import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import ArticleRelated from './ArticleRelated'
import type { RelatedArticle } from '@portfolio/types/components'

const articles: RelatedArticle[] = [
  {
    title: 'On the discipline of restraint',
    slug: { _type: 'slug', current: 'articles/on-restraint' },
    tags: ['Essay', 'Craft'],
    _createdAt: '2026-04-01T00:00:00Z',
    editionNumber: 14,
  },
  {
    title: 'Typography that does not beg for attention',
    slug: { _type: 'slug', current: 'articles/typography' },
    tags: ['Craft'],
    _createdAt: '2026-03-01T00:00:00Z',
    editionNumber: 12,
  },
]

test('renders related article titles', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleRelated relatedArticles={articles} />)
  )
  assert.match(markup, /On the discipline of restraint/)
  assert.match(markup, /Typography that does not beg for attention/)
})

test('returns null when no articles', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleRelated relatedArticles={[]} />)
  )
  assert.equal(markup, '')
})
