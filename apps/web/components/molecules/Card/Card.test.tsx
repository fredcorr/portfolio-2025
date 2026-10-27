import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'
import type { PortableTextBlock } from '@portabletext/react'

import { RichTextSize } from '@/components/atoms/RichText/RichText'
import Card, { CardSpacing, CardTitleSize } from './Card'
import type { PolymorphicProps } from '@/types'

const AnimStub = ({
  as: As = 'article' as React.ElementType,
  children,
  ...rest
}: PolymorphicProps) => React.createElement(As as string, rest, children)

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

const image = {
  _type: 'image' as const,
  asset: {
    url: '/test-image.jpg',
    metadata: { dimensions: { width: 800, height: 600 } },
  },
  alt: 'Alt text',
}

test('renders image, icon, index, title, and subtitle', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Card
        title="Test Project"
        subtitle={block('Details go here')}
        href="/projects/test"
        image={image}
        iconName="sparkles"
        index={0}
      />
    )
  )

  assert.match(markup, /href="\/projects\/test"/)
  assert.match(markup, /alt="Alt text"/)
  assert.match(markup, /data-icon="sparkles"/)
  assert.match(markup, />01</)
  assert.match(markup, /Test Project/)
  assert.match(markup, /Details go here/)
})

test('respects sizing and spacing variants', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Card
        title="Sized Project"
        subtitle={block('Sized body')}
        spacing={CardSpacing.Roomy}
        titleSize={CardTitleSize.Large}
        subtitleSize={RichTextSize.Md}
      />
    )
  )

  assert.match(markup, /text-heading-3/)
  assert.match(markup, /text-body-md/)
  assert.match(markup, /gap-6/)
})

test('CardSpacing.Spacious renders gap-8', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="Spacious Card" spacing={CardSpacing.Spacious} />)
  )

  assert.match(markup, /gap-8/)
})

test('does not render an image when one is not provided', () => {
  const markup = renderToStaticMarkup(withIntl(<Card title="No Image Card" />))

  assert.doesNotMatch(markup, /<img/)
})

test('renders string subtitles as plain text', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="String Subtitle" subtitle="Plain text subtitle" />)
  )

  assert.match(markup, /Plain text subtitle/)
})

test('renders AnimationComponent as article when no href', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="Animated" AnimationComponent={AnimStub} />)
  )

  assert.match(markup, /<article/)
})

test('renders AnimationComponent as link when href is provided', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Card
        title="Animated Link"
        href="/projects/test"
        AnimationComponent={AnimStub}
      />
    )
  )

  assert.match(markup, /href="\/projects\/test"/)
  assert.match(markup, /aria-label="View Animated Link"/)
})

test('squareImage applies aspect-square, rounded-none, blur and scale transition classes', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="Square" image={image} squareImage />)
  )

  assert.match(markup, /aspect-square/)
  assert.match(markup, /rounded-none/)
  // blur is on wrapper (md: prefix for desktop only)
  assert.match(markup, /md:blur-\[4px\]/)
  assert.match(markup, /md:group-hover:blur-none/)
  assert.match(markup, /md:group-hover:scale-105/)
  assert.match(markup, /duration-\[700ms\]/)
})

test('imageShadow applies shadow and hover shadow transition classes', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="Shadow" image={image} imageShadow />)
  )

  assert.match(
    markup,
    /shadow-\[16px_16px_36px_4px_rgba\(128,128,128,0\.54\)\]/
  )
  assert.match(
    markup,
    /group-hover:shadow-\[24px_24px_48px_8px_rgba\(128,128,128,0\.69\)\]/
  )
  assert.match(markup, /transition-shadow/)
  assert.match(markup, /duration-\[700ms\]/)
})

test('indexAboveImage renders badge above image with mix-blend-difference', () => {
  const markup = renderToStaticMarkup(
    withIntl(<Card title="Badge" image={image} index={0} indexAboveImage />)
  )

  assert.match(markup, /mix-blend-difference/)
  assert.match(markup, />01</)
  // Card root element should not have overflow-hidden (badge must protrude above).
  // Check only the root opening tag, not the Image atom's inner wrapper.
  const rootTag = markup.match(/^<[^>]+>/)?.[0] ?? ''
  assert.doesNotMatch(rootTag, /overflow-hidden/)
})

test('indexAboveImage suppresses the in-content icon row', () => {
  const withAbove = renderToStaticMarkup(
    withIntl(<Card title="Above" image={image} index={0} indexAboveImage />)
  )
  const withoutAbove = renderToStaticMarkup(
    withIntl(<Card title="Below" image={image} index={0} />)
  )

  // Without indexAboveImage, index renders inside the content area (text-foreground/70)
  assert.match(withoutAbove, /text-foreground\/70/)
  // With indexAboveImage, no in-content index span
  assert.doesNotMatch(withAbove, /text-foreground\/70/)
})
