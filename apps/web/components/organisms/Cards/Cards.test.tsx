import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Cards from './Cards'
import { cardsMock } from '@/mocks/organisms/cards'

test('renders heading, subtitle, and cards', () => {
  const markup = renderToStaticMarkup(withIntl(<Cards {...cardsMock} />))

  assert.match(markup, /Capabilities/)
  assert.match(markup, /Focused on brand, product, and visual systems/)
  assert.match(markup, /Product Design/)
  assert.match(markup, /Visual Systems/)
  assert.match(markup, /Brand Craft/)
})

test('renders fallback when no items provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Cards {...cardsMock} items={[]} />)
  )

  assert.match(markup, /Cards will appear here once they are configured/)
})
