import assert from 'node:assert/strict'
import test from 'node:test'
import { Locale, PageTypeName } from '@portfolio/types/base'
import type { CmsPages } from '@portfolio/types/pages'

import { getPageSchemas } from './get-page-schemas'

const contactPage = (language?: Locale) =>
  ({
    _id: 'contact',
    _type: PageTypeName.ContactPage,
    _updatedAt: '2026-10-01T00:00:00Z',
    title: 'Contatti',
    slug: {
      _type: 'slug',
      current: language ? `${language}/contact` : 'contact',
    },
    ...(language && { language }),
  }) as unknown as CmsPages

test('page schemas carry the page language', () => {
  const [entry] = getPageSchemas(
    'https://example.com',
    contactPage(Locale.Italian)
  )

  assert.ok(entry)
  assert.equal((entry.schema as { inLanguage?: string }).inLanguage, 'it')
})

test('a page without a language field is English', () => {
  const [entry] = getPageSchemas('https://example.com', contactPage())

  assert.equal((entry.schema as { inLanguage?: string }).inLanguage, 'en')
})
