import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import { ComponentTypeName } from '@portfolio/types/base'
import type { HomePageHeroComponent } from '@portfolio/types/components'
import { HomePageHero } from './HomePageHero'

const createHero = (
  overrides: Partial<HomePageHeroComponent> = {}
): HomePageHeroComponent => ({
  _type: ComponentTypeName.HomePageHero,
  title: 'Websites & Branding',
  subtitle:
    "Hello, I'm Joey, an online product designer focusing on brand identity, advertising, and no-code instruments.",
  getInTouchTitle: "Let's talk",
  ...overrides,
})

test('renders the provided headline and supporting copy', () => {
  const markup = renderToStaticMarkup(
    withIntl(<HomePageHero {...createHero()} />)
  )

  assert.match(markup, /Websites &amp; Branding/)
  assert.match(markup, /Joey, an online product designer/)
})

test('falls back to default contact email when env is not set', () => {
  const originalEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  delete process.env.NEXT_PUBLIC_CONTACT_EMAIL

  const markup = renderToStaticMarkup(
    withIntl(<HomePageHero {...createHero()} />)
  )

  assert.match(markup, /mailto:hello@joey\.co/)
  assert.match(markup, /hello@joey\.co/)

  if (typeof originalEmail === 'string') {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = originalEmail
  } else {
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL
  }
})

test('uses contact email from env when provided', () => {
  const originalEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL
  process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'team@example.com'

  const markup = renderToStaticMarkup(
    withIntl(<HomePageHero {...createHero()} />)
  )

  assert.match(markup, /mailto:team@example\.com/)
  assert.match(markup, /team@example\.com/)

  if (typeof originalEmail === 'string') {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = originalEmail
  } else {
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL
  }
})

test('uses provided next-section target for scroll cta', () => {
  const markup = renderToStaticMarkup(
    withIntl(<HomePageHero {...createHero()} scrollTargetId="section-next" />)
  )

  assert.match(markup, /href="#section-next"/)
})

test('falls back to main-content when next-section target is missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<HomePageHero {...createHero()} />)
  )

  assert.match(markup, /href="#main-content"/)
})
