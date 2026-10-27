import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import CookieBanner from './CookieBanner'

describe('CookieBanner', () => {
  it('renders nothing to the DOM', () => {
    const html = renderToStaticMarkup(withIntl(<CookieBanner />))
    assert.equal(html, '')
  })
})
