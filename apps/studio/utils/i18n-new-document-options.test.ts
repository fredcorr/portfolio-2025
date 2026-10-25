import test from 'node:test'
import assert from 'node:assert/strict'
import type { TemplateItem } from 'sanity'
import { filterGlobalTemplatesForI18n } from './i18n-new-document-options'

const ids = (templateIds: string[]): TemplateItem[] =>
  templateIds.map(templateId => ({ templateId }))

const kept = (templateIds: string[]) =>
  filterGlobalTemplatesForI18n(ids(templateIds)).map(t => t.templateId)

test('filterGlobalTemplatesForI18n - keeps only per-language page templates', () => {
  assert.deepEqual(
    kept(['article', 'article-parameterized', 'article-en', 'article-it']),
    ['article-en', 'article-it']
  )
})

test('filterGlobalTemplatesForI18n - hides every singleton template', () => {
  assert.deepEqual(
    kept([
      'homepage',
      'homepage-en',
      'homepage-it',
      'homepage-parameterized',
      'settings',
    ]),
    []
  )
})

test('filterGlobalTemplatesForI18n - leaves non-translatable types alone', () => {
  assert.deepEqual(kept(['codeBlock', 'some-type-it']), [
    'codeBlock',
    'some-type-it',
  ])
})
