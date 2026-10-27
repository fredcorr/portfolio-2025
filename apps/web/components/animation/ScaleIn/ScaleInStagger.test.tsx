import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ScaleInStagger from './ScaleInStagger'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ScaleInStagger>
        <p>Hello</p>
      </ScaleInStagger>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ScaleInStagger className="test-class">content</ScaleInStagger>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ScaleInStagger as="li">content</ScaleInStagger>)
  )
  assert.match(markup, /<li/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ScaleInStagger>content</ScaleInStagger>)
  )
  assert.match(markup, /<div/)
})
