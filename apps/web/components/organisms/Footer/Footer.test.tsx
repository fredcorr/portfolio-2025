import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Locale } from '@portfolio/types/base'
import { withIntl } from '@/test-utils/with-intl'

import Footer from './Footer'
import { footerMock } from '@/mocks/organisms/footer'

test('renders email CTA and social links', () => {
  const markup = renderToStaticMarkup(withIntl(<Footer {...footerMock} />))

  assert.match(markup, /mailto:hello@federicocorradi\.com/)
  assert.match(markup, /Dribbble/)
  assert.match(markup, /Instagram/)
  assert.match(markup, /LinkedIn/)
})

test('renders dynamic year and author in rail', () => {
  const year = new Date().getFullYear()
  const markup = renderToStaticMarkup(withIntl(<Footer {...footerMock} />))

  assert.match(markup, new RegExp(`${year}`))
  assert.match(markup, /Federico Corradi/)
})

test('renders cookie settings button in rail', () => {
  const markup = renderToStaticMarkup(withIntl(<Footer {...footerMock} />))

  assert.match(
    markup,
    /<button[^>]*type="button"[^>]*>Cookie settings<\/button>/
  )
})

test('omits email CTA when email is missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Footer {...footerMock} email={undefined} />)
  )

  assert.ok(!markup.includes('mailto:'))
})

test('renders availability kicker when openForProjects is true', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Footer
        {...footerMock}
        openForProjects={true}
        availabilityText="Q2 2026"
      />
    )
  )

  assert.match(markup, /Open for projects/)
  assert.match(markup, /Q2 2026/)
})

test('omits availability kicker when openForProjects is false', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Footer {...footerMock} openForProjects={false} />)
  )

  assert.ok(!markup.includes('Open for projects'))
})

test('renders sitemap nav links from navigationItems', () => {
  const markup = renderToStaticMarkup(withIntl(<Footer {...footerMock} />))

  assert.match(markup, /href="\/work"/)
  assert.match(markup, /href="\/about"/)
  assert.match(markup, /Work/)
  assert.match(markup, /About/)
})

test('renders its chrome in Italian on Italian pages', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Footer {...footerMock} />, Locale.Italian)
  )

  assert.match(markup, /Disponibile per nuovi progetti · Q2 2026/)
  assert.match(markup, /<em class="not-italic">Parliamone\.<\/em>/)
  assert.match(markup, /Mappa del sito/)
  assert.match(markup, /© 2026 · Federico Corradi · Milano, IT/)
  assert.match(markup, /Torna su/)
  assert.match(markup, /Impostazioni cookie/)
})
