import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import { toolSetMock } from '@/mocks/organisms/tool-set'
import ToolSet from './ToolSet'

test('renders heading and tools when provided', () => {
  const markup = renderToStaticMarkup(withIntl(<ToolSet {...toolSetMock} />))

  assert.match(markup, /data-organism=\"tool-set\"/)
  assert.match(markup, /Our tools of choice/)
  assert.match(markup, /Figma/)
  assert.match(markup, /Slack/)
  assert.match(markup, /Linear/)
  assert.match(markup, /Notion/)
})

test('returns null when title and tools are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <ToolSet _type={toolSetMock._type} title={undefined} tools={undefined} />
    )
  )

  assert.equal(markup, '')
})
