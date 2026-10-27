import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import React from 'react'
import { Heading } from './Heading'

test('renders the requested heading level', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Heading level={3} className="headline">
        Hello world
      </Heading>
    )
  )

  assert.match(markup, /^<h3 class="headline">Hello world<\/h3>$/)
})

test('clamps levels below 1 and above 6', () => {
  const low = renderToStaticMarkup(
    withIntl(<Heading level={0}>Too low</Heading>)
  )
  const high = renderToStaticMarkup(
    withIntl(<Heading level={10}>Too high</Heading>)
  )

  assert.match(low, /^<h1>Too low<\/h1>$/)
  assert.match(high, /^<h6>Too high<\/h6>$/)
})

test('defaults to h2 when no level is provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Heading>Default level</Heading>)
  )

  assert.match(markup, /^<h2>Default level<\/h2>$/)
})
