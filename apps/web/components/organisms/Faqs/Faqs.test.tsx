import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import { faqsMock } from '@/mocks/organisms/faqs'
import Faqs from './Faqs'

test('renders heading and FAQ items when provided', () => {
  const markup = renderToStaticMarkup(withIntl(<Faqs {...faqsMock} />))

  assert.match(markup, /data-organism="faqs"/)
  assert.match(markup, /FAQs about Branding/)
  assert.match(markup, /<button/)
  assert.match(markup, /Do you offer logo design as a separate service\\?/)
})

test('returns null when title and questions are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Faqs _type={faqsMock._type} title={undefined} questions={undefined} />
    )
  )

  assert.equal(markup, '')
})
