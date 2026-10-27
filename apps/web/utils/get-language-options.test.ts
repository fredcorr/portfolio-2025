import assert from 'node:assert/strict'
import test from 'node:test'

import { Locale } from '@portfolio/types/base'
import { getLanguageOptions } from './get-language-options'

const slug = (current: string) => ({ _type: 'slug' as const, current })

test('links each locale to its translation of the page', () => {
  const options = getLanguageOptions(
    Locale.English,
    {
      _id: 'meta-1',
      items: [
        { _id: 'a-en', language: Locale.English, slug: slug('journals/foo') },
        {
          _id: 'a-it',
          language: Locale.Italian,
          slug: slug('it/journals/foo'),
        },
      ],
    },
    '/journals/foo'
  )

  assert.deepEqual(options, [
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
  ])
})

test('an untranslated page sends the other locale to its homepage', () => {
  const [, italian] = getLanguageOptions(Locale.English, null, '/about')

  assert.deepEqual(italian, {
    locale: Locale.Italian,
    href: '/it',
    isCurrent: false,
    isAvailable: false,
  })
})

test('from an Italian-only page, English falls back to /', () => {
  const [english, italian] = getLanguageOptions(
    Locale.Italian,
    undefined,
    '/it/solo'
  )

  assert.deepEqual(english, {
    locale: Locale.English,
    href: '/',
    isCurrent: false,
    isAvailable: false,
  })
  assert.equal(italian.isCurrent, true)
  assert.equal(italian.href, '/it/solo')
})

test('maps the homepage pair to / and /it', () => {
  const options = getLanguageOptions(
    Locale.Italian,
    {
      _id: 'meta-home',
      items: [
        { _id: 'homepage', language: Locale.English, slug: slug('/') },
        { _id: 'home-it', language: Locale.Italian, slug: slug('it') },
      ],
    },
    '/it'
  )

  assert.deepEqual(
    options.map(option => [option.locale, option.href, option.isAvailable]),
    [
      [Locale.English, '/', true],
      [Locale.Italian, '/it', true],
    ]
  )
})
