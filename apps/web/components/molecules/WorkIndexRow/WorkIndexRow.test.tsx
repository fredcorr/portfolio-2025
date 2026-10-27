import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import React from 'react'
import WorkIndexRow from './WorkIndexRow'

const image = {
  _type: 'image' as const,
  asset: {
    url: '/test.jpg',
    metadata: { dimensions: { width: 800, height: 600 } },
  },
  alt: 'Test image',
}

test('renders title', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" index={0} />)
  )
  assert.match(markup, /Senta/)
})

test('renders formatted index badge', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" index={0} image={image} />)
  )
  assert.match(markup, />01</)
})

test('renders second item as 02', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Crtly" index={1} image={image} />)
  )
  assert.match(markup, />02</)
})

test('renders tag pill', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" tag="Mobile App" index={0} />)
  )
  assert.match(markup, /Mobile App/)
})

test('renders description', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <WorkIndexRow
        title="Senta"
        description="Habit tracking with zero friction."
        index={0}
      />
    )
  )
  assert.match(markup, /Habit tracking with zero friction/)
})

test('renders year', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" year={2025} index={0} />)
  )
  assert.match(markup, /2025/)
})

test('renders image when provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" image={image} index={0} />)
  )
  assert.match(markup, /alt="Test image"/)
})

test('does not render image element when no image', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" index={0} />)
  )
  assert.doesNotMatch(markup, /<img/)
})

test('renders as link when href is provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" href="/projects/senta" index={0} />)
  )
  assert.match(markup, /href="\/projects\/senta"/)
  assert.match(markup, /aria-label="View Senta"/)
})

test('does not render aria-label when no href', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" index={0} />)
  )
  assert.doesNotMatch(markup, /aria-label="View Senta"/)
})

test('renders shadow class on image wrapper', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" image={image} index={0} />)
  )
  assert.match(
    markup,
    /shadow-\[16px_16px_36px_4px_rgba\(128,128,128,0\.54\)\]/
  )
})

test('first row has no top border', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Senta" index={0} />)
  )
  assert.doesNotMatch(markup, /border-t border-black/)
})

test('subsequent rows have top border', () => {
  const markup = renderToStaticMarkup(
    withIntl(<WorkIndexRow title="Crtly" index={1} />)
  )
  assert.match(markup, /border-t border-black/)
})
