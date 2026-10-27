import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Locale } from '@portfolio/types/base'

import { withIntl } from '@/test-utils/with-intl'
import useFormatDate from './use-format-date'

const Probe = ({ value }: { value?: string | null }) => {
  const formatDate = useFormatDate()

  return <span>{formatDate(value) ?? 'none'}</span>
}

const render = (value: string | null, locale?: Locale) =>
  renderToStaticMarkup(withIntl(<Probe value={value} />, locale))

test('formats in the page language', () => {
  assert.match(render('2026-04-14T09:00:00Z'), /April 14, 2026/)
  assert.match(render('2026-04-14T09:00:00Z', Locale.Italian), /14 aprile 2026/)
})

test('uses the site time zone, not UTC', () => {
  // 23:30 UTC on the 14th is already the 15th in Rome.
  assert.match(render('2026-04-14T23:30:00Z'), /April 15, 2026/)
})

test('missing or invalid values give nothing', () => {
  assert.match(render(null), />none</)
  assert.match(render('not a date'), />none</)
})
