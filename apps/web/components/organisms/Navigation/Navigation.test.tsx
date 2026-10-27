import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { Locale } from '@portfolio/types/base'

import { navigationMock } from '@/mocks/organisms/navigation'
import Navigation from './Navigation'

test('renders navigation items and project count', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Navigation
        items={navigationMock.items}
        projectCount={navigationMock.projectCount}
      />
    )
  )

  assert.match(markup, /data-organism="navigation"/)
  assert.match(markup, /Projects/)
  assert.match(markup, /Contact/)
  assert.match(markup, /About/)
  assert.match(markup, />8</)
})

test('renders the language switch slot', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Navigation
        items={navigationMock.items}
        languageSwitch={<span data-testid="language-switch" />}
      />
    )
  )

  assert.match(markup, /data-testid="language-switch"/)
})

test("the logo links to the current locale's homepage", () => {
  const english = renderToStaticMarkup(
    withIntl(<Navigation items={navigationMock.items} />)
  )
  const italian = renderToStaticMarkup(
    withIntl(
      <Navigation items={navigationMock.items} locale={Locale.Italian} />,
      Locale.Italian
    )
  )

  assert.match(english, /aria-label="Go to homepage"[^>]*href="\/"/)
  assert.match(italian, /aria-label="Vai alla homepage"[^>]*href="\/it"/)
})

test('labels the menu toggle in the page language', () => {
  const italian = renderToStaticMarkup(
    withIntl(<Navigation items={navigationMock.items} />, Locale.Italian)
  )

  assert.match(italian, /aria-label="Apri il menu di navigazione"/)
})
