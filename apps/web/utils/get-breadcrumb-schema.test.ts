import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getBreadcrumbLabel,
  getBreadcrumbSchema,
} from './get-breadcrumb-schema'

const SITE_URL = 'https://example.com'

const schemaFor = (
  page: Parameters<typeof getBreadcrumbSchema>[1],
  fallbackSlug?: string
) => getBreadcrumbSchema(SITE_URL, page, 'Home', fallbackSlug)

test('builds a BreadcrumbList rooted at Home', () => {
  const schema = schemaFor({
    slug: { current: 'journals/restraint' },
  })

  assert.ok(schema)
  assert.equal(schema['@context'], 'https://schema.org')
  assert.equal(schema['@type'], 'BreadcrumbList')
  assert.deepEqual(schema.itemListElement[0], {
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: SITE_URL,
  })
})

test('numbers positions from one and resolves absolute item URLs', () => {
  const schema = schemaFor({
    slug: { current: 'journals/restraint' },
  })

  assert.ok(schema)
  assert.deepEqual(
    schema.itemListElement.map(item => [item.position, item.name, item.item]),
    [
      [1, 'Home', SITE_URL],
      [2, 'Journals', `${SITE_URL}/journals`],
      [3, 'Restraint', `${SITE_URL}/journals/restraint`],
    ]
  )
})

test('names the final crumb from the page document, not the slug', () => {
  const schema = schemaFor({
    slug: { current: 'journals/on-the-discipline-of-restraint' },
    title: 'On the discipline of restraint',
  })

  assert.ok(schema)
  const last = schema.itemListElement.at(-1)
  assert.equal(last?.name, 'On the discipline of restraint')
  assert.equal(
    last?.item,
    `${SITE_URL}/journals/on-the-discipline-of-restraint`
  )
})

test('applies the same naming to every page type, not just articles', () => {
  const schema = schemaFor({
    slug: { current: 'projects/websites' },
    title: 'Go by one dresscode',
  })

  assert.ok(schema)
  assert.deepEqual(
    schema.itemListElement.map(item => item.name),
    ['Home', 'Projects', 'Go by one dresscode']
  )
})

test('leaves ancestor crumb names untouched', () => {
  const schema = schemaFor({
    slug: { current: 'journals/restraint' },
    title: 'A title',
  })

  assert.ok(schema)
  assert.equal(schema.itemListElement[1]?.name, 'Journals')
})

test('falls back to the supplied slug when the document has none', () => {
  const schema = schemaFor({}, 'journals/restraint')

  assert.ok(schema)
  assert.equal(schema.itemListElement.at(-1)?.name, 'Restraint')
})

test('returns null for the home page', () => {
  assert.equal(schemaFor({ slug: { current: '/' } }), null)
  assert.equal(schemaFor({}), null)
})

test('getBreadcrumbLabel prefers seoTitle then falls back to title', () => {
  assert.equal(
    getBreadcrumbLabel({ seoTitle: 'SEO title', title: 'Doc title' }),
    'SEO title'
  )
  assert.equal(getBreadcrumbLabel({ title: 'Doc title' }), 'Doc title')
  assert.equal(
    getBreadcrumbLabel({ seoTitle: '', title: 'Doc title' }),
    'Doc title'
  )
  assert.equal(getBreadcrumbLabel({}), undefined)
})

test('an Italian page starts its trail at the Italian homepage', () => {
  const schema = schemaFor({ slug: { current: 'it/journals/restraint' } })

  assert.ok(schema)
  assert.deepEqual(
    schema.itemListElement.map(item => [item.name, item.item]),
    [
      ['Home', `${SITE_URL}/it`],
      ['Journals', `${SITE_URL}/it/journals`],
      ['Restraint', `${SITE_URL}/it/journals/restraint`],
    ]
  )
})
