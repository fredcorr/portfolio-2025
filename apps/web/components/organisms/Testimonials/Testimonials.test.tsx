import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Testimonials from './Testimonials'
import { testimonialsMock } from '@/mocks/organisms/testimonials'

test('renders heading and testimonials', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Testimonials {...testimonialsMock} />)
  )

  assert.match(markup, /What clients say/)
  assert.match(markup, /Design Partner/)
  assert.match(markup, /Design Partner/)
  assert.match(markup, /Alex Rivera/)
})

test('renders fallback when no testimonials', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Testimonials {...testimonialsMock} testimonials={[]} />)
  )

  assert.match(markup, /Testimonials will appear here once they are published/)
})
