import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import {
  blockTextSplitMock,
  blockTextSplitLargeMock,
  blockTextStackedMock,
} from '@/mocks/organisms/block-text'
import BlockText from './BlockText'

test('renders split layout with a smaller heading style', () => {
  const markup = renderToStaticMarkup(
    withIntl(<BlockText {...blockTextSplitMock} />)
  )

  assert.match(markup, /String value/)
  assert.match(markup, /md:col-start-7/)
  assert.match(markup, /text-heading-3/)
  assert.match(markup, /text-body-lg/)
})

test('renders stacked layout with a larger heading style', () => {
  const markup = renderToStaticMarkup(
    withIntl(<BlockText {...blockTextStackedMock} />)
  )

  assert.match(markup, /String value/)
  assert.doesNotMatch(markup, /md:col-start-7/)
  assert.match(markup, /text-heading-2/)
})

test('renders split layout with a larger heading style', () => {
  const markup = renderToStaticMarkup(
    withIntl(<BlockText {...blockTextSplitLargeMock} />)
  )

  assert.match(markup, /String value/)
  assert.match(markup, /md:col-start-7/)
  assert.match(markup, /text-heading-2/)
})

test('returns null when heading and body are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <BlockText
        _type={blockTextSplitMock._type}
        title={undefined}
        body={undefined}
        splitLayout={false}
      />
    )
  )

  assert.equal(markup, '')
})
