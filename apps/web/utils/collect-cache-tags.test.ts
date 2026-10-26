import assert from 'node:assert/strict'
import test from 'node:test'

import { Locale } from '@portfolio/types/base'
import {
  chunkCacheTags,
  collectCacheTags,
  collectSetDependencyTags,
  countTag,
  normaliseDocumentId,
  typeTag,
} from './collect-cache-tags'

const EN = Locale.English
const IT = Locale.Italian

test('tags the root document by id but never by type', () => {
  const tags = collectCacheTags({
    _id: 'article-1',
    _type: 'article',
    title: 'Restraint',
  })

  assert.deepEqual(tags, ['sanity:id:article-1'])
})

test('tags nested documents by both id and type', () => {
  const tags = collectCacheTags({
    _id: 'page-1',
    _type: 'page',
    pageComponents: [
      {
        _type: 'journalsFeed',
        articles: [
          { _id: 'article-1', _type: 'article' },
          { _id: 'article-2', _type: 'article' },
        ],
      },
    ],
  })

  assert.ok(tags.includes('sanity:id:page-1'))
  assert.ok(tags.includes('sanity:id:article-1'))
  assert.ok(tags.includes('sanity:id:article-2'))
  // No `language` projected and no query locale given: English.
  assert.ok(tags.includes('sanity:type:article:en'))
  // The root's own type stays out, or editing one page would invalidate every
  // page.
  assert.ok(!tags.includes('sanity:type:page'))
})

test('ignores _type values that are not documents', () => {
  const tags = collectCacheTags({
    _id: 'page-1',
    _type: 'page',
    body: [
      { _type: 'block', children: [{ _type: 'span', text: 'hello' }] },
      { _type: 'image', asset: { _type: 'sanity.imageAsset' } },
    ],
  })

  assert.deepEqual(tags, ['sanity:id:page-1'])
})

test('treats every element of an array root as nested', () => {
  const tags = collectCacheTags([
    { _id: 'page-1', _type: 'page' },
    { _id: 'article-1', _type: 'article' },
  ])

  assert.ok(tags.includes('sanity:type:page:en'))
  assert.ok(tags.includes('sanity:type:article:en'))
})

test('normalises draft ids so they match the published entry', () => {
  assert.equal(normaliseDocumentId('drafts.article-1'), 'article-1')
  assert.equal(normaliseDocumentId('article-1'), 'article-1')

  const tags = collectCacheTags({ _id: 'drafts.article-1', _type: 'article' })
  assert.deepEqual(tags, ['sanity:id:article-1'])
})

test('deduplicates repeated references', () => {
  const tags = collectCacheTags({
    _id: 'page-1',
    _type: 'page',
    a: { _id: 'article-1', _type: 'article' },
    b: { _id: 'article-1', _type: 'article' },
  })

  assert.deepEqual(tags.filter(tag => tag === 'sanity:id:article-1').length, 1)
})

test('survives documents that reference each other', () => {
  const a: Record<string, unknown> = { _id: 'a', _type: 'project' }
  const b: Record<string, unknown> = { _id: 'b', _type: 'project', a }
  a.b = b

  const tags = collectCacheTags({ _id: 'page-1', _type: 'page', a })

  assert.ok(tags.includes('sanity:id:a'))
  assert.ok(tags.includes('sanity:id:b'))
})

test('chunks tags to the 128 per call cacheTag accepts', () => {
  const tags = Array.from({ length: 300 }, (_, i) => `sanity:id:${i}`)
  const chunks = chunkCacheTags(tags)

  assert.equal(chunks.length, 3)
  assert.equal(chunks[0].length, 128)
  assert.equal(chunks[1].length, 128)
  assert.equal(chunks[2].length, 44)
  assert.deepEqual(chunks.flat(), tags)
})

test('returns nothing for empty results', () => {
  assert.deepEqual(collectCacheTags(null), [])
  assert.deepEqual(chunkCacheTags([]), [])
})

test('declares the article set for a listing that returned nothing', () => {
  // The case no result-derived tag can reach: before the first article exists
  // there is nothing to walk, so only a declared tag can invalidate the page
  // when one is finally published.
  const page = {
    _id: 'page-journals',
    _type: 'page',
    pageComponents: [
      {
        _type: 'journalsListing',
        _key: 'a',
        initialData: { articles: [], total: 0, categories: [] },
      },
    ],
  }

  assert.deepEqual(collectCacheTags(page, EN), ['sanity:id:page-journals'])
  assert.deepEqual(collectSetDependencyTags(page, EN), [
    'sanity:type:article:en',
  ])
})

test('declares the project set for both listing components', () => {
  const forComponent = (type: string) =>
    collectSetDependencyTags(
      {
        _id: 'page-1',
        _type: 'page',
        pageComponents: [{ _type: type, _key: 'a', projects: [] }],
      },
      EN
    )

  assert.deepEqual(forComponent('workIndex'), ['sanity:type:project:en'])
  assert.deepEqual(forComponent('projectListing'), ['sanity:type:project:en'])
})

test('does not declare a set for a curated reference list', () => {
  // journalsFeed projects `articles[]->`. Every member is already in the
  // payload with an id tag, so declaring the set would invalidate every feed
  // on every unrelated article publish.
  const tags = collectSetDependencyTags(
    {
      _id: 'page-1',
      _type: 'page',
      pageComponents: [
        {
          _type: 'journalsFeed',
          _key: 'a',
          articles: [{ _id: 'article-1', _type: 'article' }],
        },
      ],
    },
    EN
  )

  assert.deepEqual(tags, [])
})

test('declares the article set on an article page, but not on a nested article', () => {
  // relatedArticles and editionNumber query across every article, so the page
  // depends on the set as a whole — the one place the root-type exclusion is
  // deliberately reopened.
  assert.deepEqual(
    collectSetDependencyTags({ _id: 'article-1', _type: 'article' }, EN),
    ['sanity:type:article:en']
  )

  // The same document nested inside another page must not drag the dependency
  // along with it.
  assert.deepEqual(
    collectSetDependencyTags(
      {
        _id: 'page-1',
        _type: 'page',
        featured: { _id: 'article-1', _type: 'article' },
      },
      EN
    ),
    []
  )
})

test('survives mutual references while declaring', () => {
  const a: Record<string, unknown> = { _type: 'workIndex' }
  const b: Record<string, unknown> = { _type: 'journalsListing', a }
  a.b = b

  const tags = collectSetDependencyTags({ _id: 'page-1', _type: 'page', a }, EN)

  assert.deepEqual(tags.sort(), [
    'sanity:type:article:en',
    'sanity:type:project:en',
  ])
})

test('count tags are namespaced apart from type tags', () => {
  // The two must never collide: an entry declaring only a count must not be
  // caught by the type tag an ordinary edit fires.
  assert.equal(countTag('project'), 'sanity:count:project')
  assert.notEqual(countTag('project'), 'sanity:type:project')
})

test('locale-scoped tags: an Italian page depends on Italian sets only', () => {
  const page = {
    _id: 'page-it-journals',
    _type: 'page',
    pageComponents: [
      {
        _type: 'journalsListing',
        _key: 'a',
        initialData: {
          // Listing results don't project `language`; the query locale applies.
          articles: [{ _id: 'article-it-1', _type: 'article' }],
        },
      },
    ],
  }

  const tags = [
    ...collectCacheTags(page, IT),
    ...collectSetDependencyTags(page, IT),
  ]

  assert.ok(tags.includes('sanity:type:article:it'))
  assert.ok(!tags.includes('sanity:type:article:en'))
  assert.ok(!tags.includes('sanity:type:article'))
})

test('without a query locale, each document is tagged by its own language', () => {
  // The sitemap spans locales and projects `language`.
  const tags = collectCacheTags([
    { _id: 'a', _type: 'article', language: 'it' },
    { _id: 'b', _type: 'article', language: 'en' },
    { _id: 'c', _type: 'article' },
    { _id: 'd', _type: 'article', language: 'fr' },
  ])

  assert.ok(tags.includes('sanity:type:article:it'))
  assert.ok(tags.includes('sanity:type:article:en'))
  // Missing or unsupported languages are English, as in LANGUAGE_FILTER.
  assert.equal(tags.filter(tag => tag.startsWith('sanity:type:')).length, 2)
})

test('shared types such as settings stay unscoped', () => {
  const tags = collectCacheTags({
    _id: 'page-1',
    _type: 'page',
    settings: { _id: 'settings', _type: 'settings' },
  })

  assert.ok(tags.includes('sanity:type:settings'))
})

test('type and count tags take an optional locale', () => {
  assert.equal(typeTag('article', IT), 'sanity:type:article:it')
  assert.equal(typeTag('settings'), 'sanity:type:settings')
  assert.equal(countTag('project', EN), 'sanity:count:project:en')
})
