import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import ImageGallery from './ImageGallery'
import { imageGalleryMock } from '@/mocks/organisms/image-gallery'

test('renders heading, subtitle, and image tiles', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ImageGallery {...imageGalleryMock} />)
  )

  assert.match(markup, /Work gallery/)
  assert.match(markup, /A selection of screens from the project/)
  assert.match(markup, /alt=\"Ferrari date picker UI\"/)
  assert.match(markup, /alt=\"Tsanto wellbeing page\"/)
})

test('renders empty state when images are missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<ImageGallery {...imageGalleryMock} images={[]} />)
  )

  assert.match(markup, /Images will appear here once they are published/)
})
