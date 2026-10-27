import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import ArticleFeaturedImage from './ArticleFeaturedImage'
import type { SanityImage } from '@portfolio/types/sanity'

const mockImage: SanityImage = {
  _type: 'image',
  alt: 'A misty morning in Lisbon',
  asset: {
    _type: 'reference',
    _ref: 'image-hero',
    url: '/images/hero.jpg',
    metadata: { dimensions: { width: 1600, height: 900 } },
  },
}

test('renders image with alt text as caption', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleFeaturedImage heroImage={mockImage} />)
  )
  assert.match(markup, /A misty morning in Lisbon/)
})

test('returns null when no heroImage', () => {
  const markup = renderToStaticMarkup(withIntl(<ArticleFeaturedImage />))
  assert.equal(markup, '')
})
