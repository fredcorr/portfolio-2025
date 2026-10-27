import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import AboutPageHero from './AboutPageHero'
import { aboutPageHeroMock } from '@/mocks/organisms/about-page-hero'
import { DEFAULT_CONTACT_EMAIL } from '@/utils/get-contact-email'

test('renders heading, body, meta row, secondary body, and CTA', () => {
  const markup = renderToStaticMarkup(
    withIntl(<AboutPageHero {...aboutPageHeroMock} />)
  )

  assert.match(markup, /Hey,\s*I(?:&apos;|&#x27;|')m Fede/)
  assert.match(markup, /Embarking on a journey of growth and education/)
  assert.match(markup, /Buenos Aires, Argentina/)
  assert.match(markup, /GMT\+1/)
  assert.match(markup, /Italian (?:&|&amp;) English/)
  assert.match(markup, /video game enthusiast/)
  assert.match(markup, /My resume/)
  assert.match(markup, /https:\/\/cdn\.example\.com\/my-resume\.pdf/)
  assert.match(markup, /download=""/)
  assert.match(markup, /data-icon="arrow-up-right"/)
})

test('falls back to contact email when resume URL is not provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(<AboutPageHero {...aboutPageHeroMock} resumeUrl={undefined} />)
  )

  assert.match(markup, /mailto:hello@joey\.co/)
  assert.match(markup, /hello@joey\.co/)
})

test('uses environment contact email fallback when provided', () => {
  const original = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'team@example.com'

  const markup = renderToStaticMarkup(
    withIntl(<AboutPageHero {...aboutPageHeroMock} resumeUrl={undefined} />)
  )

  assert.match(markup, /mailto:team@example\.com/)
  assert.match(markup, /team@example\.com/)

  if (typeof original === 'string') {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = original
  } else {
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL
  }
})

test('hides CTA when showCta is false', () => {
  const markup = renderToStaticMarkup(
    withIntl(<AboutPageHero {...aboutPageHeroMock} showCta={false} />)
  )

  assert.ok(!markup.includes('mailto:'))
  assert.ok(!markup.includes('My resume'))
  assert.ok(!markup.includes(DEFAULT_CONTACT_EMAIL))
})
