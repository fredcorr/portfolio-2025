import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import SlideInStagger from './SlideInStagger'
import { SlideDirection } from './SlideIn'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <SlideInStagger>
        <p>Hello</p>
      </SlideInStagger>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideInStagger className="test-class">content</SlideInStagger>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideInStagger as="article">content</SlideInStagger>)
  )
  assert.match(markup, /<article/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideInStagger>content</SlideInStagger>)
  )
  assert.match(markup, /<div/)
})

test('accepts all SlideDirection values', () => {
  for (const direction of Object.values(SlideDirection)) {
    const markup = renderToStaticMarkup(
      withIntl(<SlideInStagger direction={direction}>content</SlideInStagger>)
    )
    assert.match(markup, /content/)
  }
})
