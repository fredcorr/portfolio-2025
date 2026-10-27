import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { Locale } from '@portfolio/types/base'

import LanguagePicker from './LanguagePicker'

const translatedOptions = [
  {
    locale: Locale.English,
    href: '/journals/foo',
    isCurrent: true,
    isAvailable: true,
  },
  {
    locale: Locale.Italian,
    href: '/it/journals/foo',
    isCurrent: false,
    isAvailable: true,
  },
]

test('renders one link per language with hreflang and lang', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <LanguagePicker locale={Locale.English} options={translatedOptions} />
    )
  )

  assert.match(markup, /hrefLang="en" lang="en"[^>]*href="\/journals\/foo"/)
  assert.match(markup, /hrefLang="it" lang="it"[^>]*href="\/it\/journals\/foo"/)
  assert.match(markup, />English</)
  assert.match(markup, />Italiano</)
})

test('marks the current language and shows its code on a closed trigger', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <LanguagePicker locale={Locale.English} options={translatedOptions} />
    )
  )

  assert.match(
    markup,
    /aria-current="true"[^>]*aria-label="English \(current\)"/
  )
  assert.match(markup, /aria-expanded="false"/)
  assert.match(markup, />EN</)
  assert.match(
    markup,
    /role="toolbar"[^>]*aria-hidden="true"[^>]*class="[^"]*invisible/
  )
})

test('an untranslated language links to its homepage and says so', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <LanguagePicker
        locale={Locale.English}
        options={[
          translatedOptions[0],
          {
            locale: Locale.Italian,
            href: '/it',
            isCurrent: false,
            isAvailable: false,
          },
        ]}
      />
    )
  )

  assert.match(
    markup,
    /aria-label="Italiano — this page isn&#x27;t translated, opens the homepage"[^>]*href="\/it"/
  )
})

test('uses Italian chrome on Italian pages', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <LanguagePicker
        locale={Locale.Italian}
        options={translatedOptions.map(option => ({
          ...option,
          isCurrent: option.locale === Locale.Italian,
        }))}
      />,
      Locale.Italian
    )
  )

  assert.match(markup, /Leggi in/)
  assert.match(markup, /aria-label="Scegli la lingua"/)
  assert.match(markup, /aria-label="Chiudi selettore lingua"/)
  assert.match(markup, />IT</)
})
