import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { Locale } from '@portfolio/types/base'

import Breadcrumbs from './Breadcrumbs'

test('renders a labelled navigation landmark with an ordered list', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Breadcrumbs slug="journals/restraint" />)
  )

  assert.match(markup, /<nav[^>]*aria-label="Breadcrumb"/)
  assert.match(markup, /<ol/)
})

test('links every ancestor crumb and leaves the current page unlinked', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Breadcrumbs slug="journals/restraint" />)
  )

  assert.match(markup, /href="\/journals"/)
  assert.match(markup, />Journals</)
  assert.match(markup, /aria-current="page"/)
  assert.doesNotMatch(markup, /href="\/journals\/restraint"/)
})

test('title-cases slug segments by default', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Breadcrumbs slug="journals/on-the-discipline-of-restraint" />)
  )

  assert.match(markup, />On The Discipline Of Restraint</)
})

test('currentLabel overrides only the final crumb', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Breadcrumbs
        slug="journals/on-the-discipline-of-restraint"
        currentLabel="On the discipline of restraint"
      />
    )
  )

  assert.match(markup, />Journals</)
  assert.match(markup, />On the discipline of restraint</)
  assert.doesNotMatch(markup, />On The Discipline Of Restraint</)
})

test('ignores a blank currentLabel and falls back to the slug segment', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Breadcrumbs slug="journals/restraint" currentLabel="   " />)
  )

  assert.match(markup, />Restraint</)
})

test('renders nothing for the home page or an empty slug', () => {
  assert.equal(renderToStaticMarkup(withIntl(<Breadcrumbs slug="/" />)), '')
  assert.equal(renderToStaticMarkup(withIntl(<Breadcrumbs slug="" />)), '')
  assert.equal(renderToStaticMarkup(withIntl(<Breadcrumbs />)), '')
})

test('an Italian slug keeps the /it prefix in links but not as a crumb', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Breadcrumbs slug="it/journals/restraint" />, Locale.Italian)
  )

  assert.doesNotMatch(markup, />It</)
  assert.match(markup, /href="\/it\/journals"[^>]*>Journals</)
  assert.match(markup, /aria-label="Percorso"/)
})
