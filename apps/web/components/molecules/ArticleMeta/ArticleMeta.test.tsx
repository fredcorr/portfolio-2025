import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ArticleMeta from './ArticleMeta'

test('edition label takes its year from the raw date, not the localised label', () => {
  // An Italian label can't be parsed back by `new Date()`; the year must come
  // from `publishedYear`.
  const markup = renderToStaticMarkup(
    withIntl(
      <ArticleMeta
        dateLabel="14 aprile 2026"
        publishedYear={2026}
        editionNumber={4}
      />
    )
  )

  assert.match(markup, /N° 004 \/ 2026/)
  assert.doesNotMatch(markup, /NaN/)
})

test('without a date the edition label has no year', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleMeta editionNumber={4} />)
  )

  assert.match(markup, /N° 004</)
})
