import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import { statsMock } from '@/mocks/organisms/stats'
import Stats from './Stats'

test('renders stats items when provided', () => {
  const markup = renderToStaticMarkup(withIntl(<Stats {...statsMock} />))

  assert.match(markup, /data-organism=\"stats\"/)
  assert.match(markup, /15\+/)
  assert.match(markup, /Launched Brands/)
  assert.match(markup, /50M\+/)
  assert.match(markup, /Views Per Month/)
})

test('returns null when items are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Stats _type={statsMock._type} />)
  )

  assert.equal(markup, '')
})
