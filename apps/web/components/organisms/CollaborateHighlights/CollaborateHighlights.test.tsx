import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import CollaborateHighlights from './CollaborateHighlights'
import { collaborateHighlightsMock } from '@/mocks/organisms/collaborate-highlights'

test('renders heading and highlight items', () => {
  const markup = renderToStaticMarkup(
    withIntl(<CollaborateHighlights {...collaborateHighlightsMock} />)
  )

  assert.match(markup, /Why Collaborate/)
  assert.match(markup, /Client-Centric/)
  assert.match(markup, /Tailored Solutions/)
  assert.match(markup, /Creative Innovation/)
  assert.match(markup, /data-icon="sparkles"/)
})

test('renders empty state when no highlights provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <CollaborateHighlights {...collaborateHighlightsMock} highlights={[]} />
    )
  )

  assert.match(markup, /Highlights will appear here once they are published/)
})
