import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import WebVitals from './WebVitals'

describe('WebVitals', () => {
  it('renders nothing to the DOM', () => {
    const html = renderToStaticMarkup(withIntl(<WebVitals />))
    assert.equal(html, '')
  })
})
