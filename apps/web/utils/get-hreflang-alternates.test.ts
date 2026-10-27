import assert from 'node:assert/strict'
import test from 'node:test'

import { Locale } from '@portfolio/types/base'
import { getHreflangAlternates } from './get-hreflang-alternates'

const SITE = 'https://example.com'
const slug = (current: string) => ({ _type: 'slug' as const, current })

test('lists both versions plus x-default pointing at English', () => {
  const translations = {
    _id: 'meta-1',
    items: [
      { _id: 'a-en', language: Locale.English, slug: slug('journals/foo') },
      { _id: 'a-it', language: Locale.Italian, slug: slug('it/journals/foo') },
    ],
  }

  const expected = {
    en: 'https://example.com/journals/foo',
    it: 'https://example.com/it/journals/foo',
    'x-default': 'https://example.com/journals/foo',
  }

  // The same set from either side of the pair.
  assert.deepEqual(
    getHreflangAlternates(SITE, {
      language: Locale.English,
      slug: slug('journals/foo'),
      translations,
    }),
    expected
  )
  assert.deepEqual(
    getHreflangAlternates(SITE, {
      language: Locale.Italian,
      slug: slug('it/journals/foo'),
      translations,
    }),
    expected
  )
})

test('an untranslated English page declares itself and x-default', () => {
  assert.deepEqual(
    getHreflangAlternates(SITE, { slug: slug('about'), translations: null }),
    {
      en: 'https://example.com/about',
      'x-default': 'https://example.com/about',
    }
  )
})

test('an Italian-only page has no x-default', () => {
  assert.deepEqual(
    getHreflangAlternates(SITE, {
      language: Locale.Italian,
      slug: slug('it/solo'),
    }),
    { it: 'https://example.com/it/solo' }
  )
})

test('maps the homepage pair to / and /it', () => {
  const alternates = getHreflangAlternates(SITE, {
    language: Locale.English,
    slug: slug('/'),
    translations: {
      _id: 'meta-home',
      items: [
        { _id: 'homepage', language: Locale.English, slug: slug('/') },
        { _id: 'home-it', language: Locale.Italian, slug: slug('it') },
      ],
    },
  })

  assert.deepEqual(alternates, {
    en: 'https://example.com',
    it: 'https://example.com/it',
    'x-default': 'https://example.com',
  })
})
