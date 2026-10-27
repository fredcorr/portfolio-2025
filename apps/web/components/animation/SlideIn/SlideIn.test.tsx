import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import SlideIn, { SlideDirection } from './SlideIn'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <SlideIn>
        <p>Hello</p>
      </SlideIn>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideIn className="test-class">content</SlideIn>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideIn as="article">content</SlideIn>)
  )
  assert.match(markup, /<article/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(withIntl(<SlideIn>content</SlideIn>))
  assert.match(markup, /<div/)
})

test('accepts all SlideDirection values', () => {
  for (const direction of Object.values(SlideDirection)) {
    const markup = renderToStaticMarkup(
      withIntl(<SlideIn direction={direction}>content</SlideIn>)
    )
    assert.match(markup, /content/)
  }
})

const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <article className={className}>{children}</article>

test('renders with custom React component', () => {
  const markup = renderToStaticMarkup(
    withIntl(<SlideIn as={Wrapper}>content</SlideIn>)
  )
  assert.match(markup, /<article/)
})
