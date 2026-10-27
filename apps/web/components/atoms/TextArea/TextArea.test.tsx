import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import TextArea from './TextArea'

test('renders textarea with placeholder', () => {
  const markup = renderToStaticMarkup(
    withIntl(<TextArea label="Message" placeholder="Tell us more" rows={6} />)
  )

  assert.match(markup, /Tell us more/)
  assert.match(markup, /rows="6"/)
})

test('displays error messaging', () => {
  const markup = renderToStaticMarkup(
    withIntl(<TextArea label="Message" error="Please add a message" required />)
  )

  assert.match(markup, /Please add a message/)
  assert.match(markup, /aria-invalid="true"/)
})
