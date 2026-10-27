import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import { faqItemMock } from '@/mocks/molecules/faq-item'
import FaqItem from './FaqItem'

test('renders question and answer using an accordion button', () => {
  const markup = renderToStaticMarkup(withIntl(<FaqItem {...faqItemMock} />))

  assert.match(markup, /<button/)
  assert.match(markup, /What is included\\?/)
  assert.match(markup, /aria-expanded=\"false\"/)
  assert.match(markup, /This is the first paragraph\./)
  assert.match(markup, /This is the second paragraph\./)
})

test('returns null when question and answer are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<FaqItem question={undefined} answer={undefined} />)
  )

  assert.equal(markup, '')
})
