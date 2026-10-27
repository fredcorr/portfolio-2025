import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ArticleIntro from './ArticleIntro'
import { articleIntroMock } from '@/mocks/organisms/article-intro'

test('renders breadcrumbs, title, deck, and meta grid', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleIntro {...articleIntroMock} />)
  )

  assert.match(markup, /aria-label="Breadcrumb"/)
  assert.match(markup, /On the discipline of restraint/)
  assert.match(markup, /Most interfaces fail/)
  assert.match(markup, /April 14, 2026/)
  assert.match(markup, /9 min read/)
  assert.match(markup, /N° 014/)
  assert.match(markup, /Essay/)
})

test('links the parent journals crumb and marks the article as current', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleIntro {...articleIntroMock} />)
  )

  assert.match(markup, /href="\/journals"/)
  assert.match(markup, />Journals</)
  assert.match(markup, /aria-current="page"/)
  // The article itself is the current page, so it must not be a link.
  assert.doesNotMatch(markup, /On the discipline of restraint<\/a>/)
})

test('uses the article title rather than the slug for the final crumb', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ArticleIntro
        slug="journals/on-the-discipline-of-restraint"
        title="On the discipline of restraint"
      />
    )
  )

  assert.match(markup, /On the discipline of restraint/)
  assert.doesNotMatch(markup, /On The Discipline Of Restraint/)
})

test('renders without a slug and omits the breadcrumb region entirely', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleIntro title="Minimal title" />)
  )

  assert.match(markup, /Minimal title/)
  assert.doesNotMatch(markup, /aria-label="Breadcrumb"/)
  assert.ok(!markup.includes('N°'))
  assert.ok(!markup.includes('min read'))
  // No empty animated cell should be left behind in the hero grid.
  assert.doesNotMatch(markup, /<div[^>]*md:col-span-12[^>]*><\/div>/)
})

test('renders with no props at all', () => {
  assert.doesNotThrow(() => renderToStaticMarkup(withIntl(<ArticleIntro />)))
})

test('treats a whitespace-only slug as having no hierarchy', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleIntro slug="   " title="Minimal title" />)
  )

  assert.match(markup, /Minimal title/)
  assert.doesNotMatch(markup, /aria-label="Breadcrumb"/)
})

test('no longer renders tags or edition number in the breadcrumb row', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ArticleIntro
        slug="journals/on-the-discipline-of-restraint"
        title="On the discipline of restraint"
        tags={['Essay']}
        editionNumber={14}
      />
    )
  )

  const breadcrumbNav = markup.slice(
    markup.indexOf('aria-label="Breadcrumb"'),
    markup.indexOf('</nav>')
  )

  assert.doesNotMatch(breadcrumbNav, /Essay/)
  assert.doesNotMatch(breadcrumbNav, /N°/)
})
