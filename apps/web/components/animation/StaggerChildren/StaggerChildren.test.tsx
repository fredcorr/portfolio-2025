import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import StaggerChildren from './StaggerChildren'

test('renders children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren>
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /One/)
  assert.match(markup, /Two/)
  assert.match(markup, /Three/)
})

test('forwards className', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren className="test-class">
        <span>item</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /test-class/)
})

test('renders with custom parent tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren as="ol">
        <span>item</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /<ol/)
})

test('renders with default ul tag', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren>
        <span>item</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /<ul/)
})

test('renders multiple children', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren>
        <span>A</span>
        <span>B</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /A/)
  assert.match(markup, /B/)
})

const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <section className={className}>{children}</section>

test('renders with custom React component', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <StaggerChildren as={Wrapper}>
        <span>item</span>
      </StaggerChildren>
    )
  )
  assert.match(markup, /<section/)
})
