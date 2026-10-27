import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { Locale } from '@portfolio/types/base'
import { withIntl } from '@/test-utils/with-intl'
import en from '@/messages/en.json'
import { AnimatedStrapline } from './AnimatedStrapline'
import { animatedStraplineMock } from '@/mocks/organisms/animated-strapline'

test('renders the strapline text multiple times for continuous motion', () => {
  const markup = renderToStaticMarkup(
    withIntl(<AnimatedStrapline {...animatedStraplineMock} />)
  )
  const occurrences =
    markup.match(new RegExp(animatedStraplineMock.strapline as string, 'g'))
      ?.length ?? 0

  assert.ok(occurrences >= 2)
  assert.match(markup, /animate-strapline/)
})

test('falls back to default strapline when missing', () => {
  const markup = renderToStaticMarkup(
    withIntl(<AnimatedStrapline {...animatedStraplineMock} strapline="" />)
  )

  assert.match(markup, new RegExp(en.strapline.default))
})

test('the default strapline follows the page language', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <AnimatedStrapline {...animatedStraplineMock} strapline="" />,
      Locale.Italian
    )
  )

  assert.match(markup, /Visual design per esperienze digitali/)
})
