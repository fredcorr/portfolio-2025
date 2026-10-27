import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Select from './Select'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

test('renders the placeholder when nothing is selected', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Select
        instanceId="t"
        label="Choose one"
        placeholder="Pick…"
        options={options}
      />
    )
  )

  assert.match(markup, /Pick…/)
  // sr-only associated label
  assert.match(markup, /Choose one/)
})

test('renders the selected single value', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Select instanceId="t" label="Choose one" options={options} value="a" />
    )
  )

  assert.match(markup, /Option A/)
})

test('exposes the error via an alert', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Select
        instanceId="t"
        label="Choose one"
        options={options}
        error="Selection required"
      />
    )
  )

  assert.match(markup, /Selection required/)
  assert.match(markup, /role="alert"/)
})

test('multi variant renders selected values', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Select
        instanceId="t"
        isMulti
        aria-label="Filter"
        options={options}
        value={['a', 'b']}
        onChange={() => {}}
      />
    )
  )

  assert.match(markup, /Option A/)
  assert.match(markup, /Option B/)
})
