import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ArticleContent from './ArticleContent'
import { articleContentMock } from '@/mocks/organisms/article-content'

test('renders share rail, rich text, and sign-off', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ArticleContent
        content={articleContentMock.content}
        shareUrl={articleContentMock.shareUrl}
        shareTitle={articleContentMock.shareTitle}
        tags={['Design', 'Craft']}
      />
    )
  )

  assert.match(markup, /Share/)
  assert.match(markup, /linkedin\.com\/sharing\/share-offsite/)
  assert.match(markup, /twitter\.com\/intent\/tweet/)
  assert.match(markup, /The Power of Visual Identity/)
  assert.match(markup, /Federico Corradi/)
  assert.match(markup, /Design/)
})

test('renders sign-off even without content', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ArticleContent shareUrl="https://example.com/a" />)
  )
  assert.match(markup, /Federico Corradi/)
})

test('returns empty markup when no content and no shareUrl', () => {
  const markup = renderToStaticMarkup(withIntl(<ArticleContent />))
  assert.equal(markup, '')
})
