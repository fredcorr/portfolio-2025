import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { Locale } from '@portfolio/types/base'

import Pagination from './Pagination'

const noop = () => {}

test('renders nothing for a single page', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Pagination currentPage={1} totalPages={1} onPageChange={noop} />)
  )
  assert.equal(markup, '')
})

test('marks the current page with aria-current', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Pagination currentPage={2} totalPages={3} onPageChange={noop} />)
  )
  assert.match(markup, /aria-current="page"/)
  assert.match(markup, /aria-label="Pagination"/)
})

test('windows large ranges with a gap', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Pagination currentPage={5} totalPages={20} onPageChange={noop} />)
  )
  // first, neighbours, last shown; gaps collapsed to an ellipsis
  assert.match(markup, /…/)
  assert.match(markup, />1</)
  assert.match(markup, />20</)
})

test('labels the controls in the page language', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Pagination currentPage={2} totalPages={3} onPageChange={noop} />,
      Locale.Italian
    )
  )

  assert.match(markup, /aria-label="Paginazione"/)
  assert.match(markup, /Prec\./)
  assert.match(markup, /Succ\./)
})
