import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import type { PortableTextBlock } from '@portabletext/react'
import RichText, { RichTextSize } from './RichText'

const block = (text: string): PortableTextBlock[] => [
  {
    _key: `${text}-block`,
    _type: 'block',
    children: [
      {
        _key: `${text}-span`,
        _type: 'span',
        text,
        marks: [],
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]

test('renders rich text with default size', () => {
  const markup = renderToStaticMarkup(
    withIntl(<RichText value={block('Hello world')} />)
  )

  assert.match(markup, /class="font-body text-body-xl leading-relaxed mb-6/)
  assert.match(markup, />Hello world<\/p>$/)
})

test('supports configurable font sizes', () => {
  const markup = renderToStaticMarkup(
    withIntl(<RichText value={block('Sized text')} size={RichTextSize.Lg} />)
  )

  assert.match(markup, /text-body-lg/)
})

test('forwards custom components to PortableText', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <RichText
        value={[
          {
            _key: 'custom-block',
            _type: 'block',
            children: [
              {
                _key: 'child-1',
                _type: 'span',
                text: 'Custom',
                marks: ['strong'],
              },
            ],
            markDefs: [],
            style: 'normal',
          },
        ]}
        components={{
          block: {
            normal: ({ children }) => (
              <p className="custom-block">{children}</p>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong data-strong="yes">{children}</strong>
            ),
          },
        }}
        className="wrapper"
      />
    )
  )

  assert.match(markup, /^<div class="wrapper">/)
  assert.match(markup, /class="custom-block"/)
  assert.match(markup, /<strong data-strong="yes">Custom<\/strong>/)
})
