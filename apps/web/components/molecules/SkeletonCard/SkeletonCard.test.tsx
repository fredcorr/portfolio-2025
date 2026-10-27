import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import SkeletonCard from './SkeletonCard'

test('renders without throwing', () => {
  const markup = renderToStaticMarkup(withIntl(<SkeletonCard />))
  assert.ok(markup.length > 0)
})

test('includes animate-pulse class', () => {
  const markup = renderToStaticMarkup(withIntl(<SkeletonCard />))
  assert.match(markup, /animate-pulse/)
})

test('renders image placeholder with correct aspect ratio', () => {
  const markup = renderToStaticMarkup(withIntl(<SkeletonCard />))
  assert.match(markup, /aspect-\[3\/2\]/)
})
