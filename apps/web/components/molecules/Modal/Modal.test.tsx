import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Modal from './Modal'

const portableDescription = [
  {
    _key: 'desc-block',
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _key: 'desc-span',
        _type: 'span',
        text: 'This is a modal description.',
        marks: [],
      },
    ],
  },
]

test('returns null markup when closed', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Modal isOpen={false} onClose={() => {}} />)
  )

  assert.equal(markup, '')
})

test('renders success variant with title and description', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Modal
        isOpen
        title="All good"
        description={portableDescription}
        onClose={() => {}}
        variant="success"
        actionLabel="Close"
      />
    )
  )

  assert.match(markup, /All good/)
  assert.match(markup, /This is a modal description/)
  assert.match(markup, /bg-status-success/)
})

test('renders error variant styles', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Modal
        isOpen
        title="Error occurred"
        description={portableDescription}
        onClose={() => {}}
        variant="error"
        actionLabel="Close"
      />
    )
  )

  assert.match(markup, /Error occurred/)
  assert.match(markup, /bg-status-error/)
})
