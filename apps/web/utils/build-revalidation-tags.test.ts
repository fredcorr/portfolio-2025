import assert from 'node:assert/strict'
import test from 'node:test'

import { buildRevalidationTags } from './build-revalidation-tags'

const sorted = (tags: Set<string>) => [...tags].sort()

test('Italian article publish: scoped to Italian sets and its own URL', () => {
  const tags = buildRevalidationTags(
    {
      _id: 'article-it-1',
      _type: 'article',
      slug: 'it/journals/foo',
      language: 'it',
    },
    'create'
  )

  assert.deepEqual(sorted(tags), [
    'sanity:count:article:it',
    'sanity:id:article-it-1',
    'sanity:llms',
    'sanity:page:it/journals/foo',
    'sanity:sitemap',
    'sanity:type:article:it',
  ])
})

test('Italian article delete: leaves English entries cached', () => {
  // A delete's payload comes from before(), so it carries everything the
  // document had — including its language.
  const tags = buildRevalidationTags(
    {
      _id: 'article-it-1',
      _type: 'article',
      slug: 'it/journals/foo',
      language: 'it',
    },
    'delete'
  )

  assert.ok(tags.has('sanity:type:article:it'))
  assert.ok(tags.has('sanity:count:article:it'))
  assert.ok(tags.has('sanity:page:it/journals/foo'))
  assert.ok(![...tags].some(tag => tag.endsWith(':en')))
})

test('update withholds count tags, as before', () => {
  const tags = buildRevalidationTags(
    { _id: 'project-1', _type: 'project', slug: 'projects/a', language: 'en' },
    'update'
  )

  assert.ok(tags.has('sanity:type:project:en'))
  assert.ok(![...tags].some(tag => tag.startsWith('sanity:count:')))
})

test('missing language fires every locale (pre-translation docs, old projections)', () => {
  const tags = buildRevalidationTags(
    { _id: 'article-1', _type: 'article', slug: 'journals/bar' },
    'delete'
  )

  for (const tag of [
    'sanity:type:article:en',
    'sanity:type:article:it',
    'sanity:count:article:en',
    'sanity:count:article:it',
  ]) {
    assert.ok(tags.has(tag), tag)
  }
})

test('unrecognised language also fires every locale', () => {
  const tags = buildRevalidationTags(
    { _id: 'article-1', _type: 'article', language: 'fr' },
    'create'
  )

  assert.ok(tags.has('sanity:type:article:en'))
  assert.ok(tags.has('sanity:type:article:it'))
})

test('unknown operation over-invalidates counts', () => {
  const tags = buildRevalidationTags(
    { _id: 'project-1', _type: 'project', language: 'en' },
    null
  )

  assert.ok(tags.has('sanity:count:project:en'))
})

test('settings stay unscoped and keep their explicit tag', () => {
  const tags = buildRevalidationTags(
    { _id: 'settings', _type: 'settings' },
    'update'
  )

  assert.deepEqual(sorted(tags), [
    'sanity:id:settings',
    'sanity:settings',
    'sanity:type:settings',
  ])
})

test('draft ids are normalised', () => {
  const tags = buildRevalidationTags(
    { _id: 'drafts.article-1', _type: 'article', language: 'en' },
    'update'
  )

  assert.ok(tags.has('sanity:id:article-1'))
})

test('a payload with neither id nor type yields nothing', () => {
  assert.equal(buildRevalidationTags({}, 'delete').size, 0)
})

test('translation metadata: refreshes every version, the sitemap and the nav', () => {
  const tags = buildRevalidationTags(
    {
      _id: 'meta-1',
      _type: 'translation.metadata',
      refs: ['article-en-1', 'article-it-1'],
    },
    'update'
  )

  assert.deepEqual(sorted(tags), [
    'sanity:id:article-en-1',
    'sanity:id:article-it-1',
    'sanity:id:meta-1',
    'sanity:settings',
    'sanity:sitemap',
    'sanity:type:translation.metadata',
  ])
})

test('translation metadata delete: before() refs still invalidate the pages', () => {
  const tags = buildRevalidationTags(
    { _id: 'meta-1', _type: 'translation.metadata', refs: ['homepage'] },
    'delete'
  )

  assert.ok(tags.has('sanity:id:homepage'))
  assert.ok(tags.has('sanity:sitemap'))
})

test('translation metadata without refs (old projection) still fires its own tags', () => {
  const tags = buildRevalidationTags(
    { _id: 'meta-1', _type: 'translation.metadata' },
    'create'
  )

  assert.ok(tags.has('sanity:id:meta-1'))
  assert.ok(tags.has('sanity:settings'))
})
