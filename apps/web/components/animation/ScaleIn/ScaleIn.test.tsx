import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ScaleIn from './ScaleIn'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ScaleIn>
        <p>Hello</p>
      </ScaleIn>
    )
  )
  assert.match(markup, /Hello/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ScaleIn className="test-class">content</ScaleIn>)
  )
  assert.match(markup, /test-class/)
})

test('renders with custom element tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ScaleIn as="figure">content</ScaleIn>)
  )
  assert.match(markup, /<figure/)
})

test('renders with default div tag', () => {
  const markup = renderToStaticMarkup(withIntl(<ScaleIn>content</ScaleIn>))
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
    withIntl(<ScaleIn as={Wrapper}>content</ScaleIn>)
  )
  assert.match(markup, /<article/)
})
