import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Checkbox from './Checkbox'

test('renders checkbox with label', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Checkbox label="Accept terms" name="terms" />)
  )

  assert.match(markup, /Accept terms/)
  assert.match(markup, /type="checkbox"/)
})

test('sets required and error state', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Checkbox label="Accept terms" required error="Must accept" />)
  )

  assert.match(markup, /Must accept/)
  assert.match(markup, /aria-required="true"/)
  assert.match(markup, /aria-invalid="true"/)
})
