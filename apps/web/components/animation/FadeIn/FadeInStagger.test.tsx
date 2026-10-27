import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import FadeInStagger from './FadeInStagger'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <FadeInStagger>
        <p>Hello</p>
      </FadeInStagger>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FadeInStagger className="test-class">content</FadeInStagger>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FadeInStagger as="section">content</FadeInStagger>)
  )
  assert.match(markup, /<section/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FadeInStagger>content</FadeInStagger>)
  )
  assert.match(markup, /<div/)
})
