import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Icon from './Icon'

test('renders a lucide icon by name', () => {
  const markup = renderToStaticMarkup(withIntl(<Icon name="link" />))

  assert.match(markup, /<svg/)
  assert.match(markup, /data-icon="link"/)
})

test('normalises kebab-case names to lucide PascalCase', () => {
  const markup = renderToStaticMarkup(withIntl(<Icon name="arrow-right" />))

  assert.match(markup, /<svg/)
})

test('renders brand icons that lucide no longer ships', () => {
  for (const name of ['linkedin', 'facebook']) {
    const markup = renderToStaticMarkup(withIntl(<Icon name={name} />))

    assert.match(markup, /<svg/, `${name} should render an svg`)
    assert.match(markup, /<path/, `${name} should render a path`)
    assert.match(markup, /fill="currentColor"/)
  }
})

test('maps the legacy twitter name onto the X mark', () => {
  const markup = renderToStaticMarkup(withIntl(<Icon name="twitter" />))

  assert.match(markup, /<path/)
  assert.match(markup, /data-icon="twitter"/)
})

test('exposes a title as an img role for accessible naming', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Icon name="linkedin" title="LinkedIn" />)
  )

  assert.match(markup, /role="img"/)
  assert.match(markup, /<title>LinkedIn<\/title>/)
  assert.doesNotMatch(markup, /aria-hidden/)
})

test('hides decorative icons from assistive tech', () => {
  const markup = renderToStaticMarkup(withIntl(<Icon name="linkedin" />))

  assert.match(markup, /aria-hidden="true"/)
})

test('returns nothing for an unknown icon name', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Icon name="definitely-not-an-icon" />)
  )

  assert.equal(markup, '')
})
