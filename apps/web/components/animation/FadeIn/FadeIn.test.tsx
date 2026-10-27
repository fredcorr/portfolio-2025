import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import FadeIn from './FadeIn'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <FadeIn>
        <p>Hello</p>
      </FadeIn>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FadeIn className="test-class">content</FadeIn>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FadeIn as="section">content</FadeIn>)
  )
  assert.match(markup, /<section/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(withIntl(<FadeIn>content</FadeIn>))
  assert.match(markup, /<div/)
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
    withIntl(<FadeIn as={Wrapper}>content</FadeIn>)
  )
  assert.match(markup, /<article/)
})
