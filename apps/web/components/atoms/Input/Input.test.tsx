import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Input from './Input'

test('renders input with placeholder and label text', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Input label="Email" placeholder="Enter email" />)
  )

  assert.match(markup, /Enter email/)
  assert.match(markup, /Email/)
})

test('renders error message and aria attributes', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Input label="Email" error="Required field" required />)
  )

  assert.match(markup, /Required field/)
  assert.match(markup, /aria-invalid="true"/)
  assert.match(markup, /aria-required="true"/)
})
