import React from 'react'
import { useLocale } from 'next-intl'
import type { FaqsComponent } from '@portfolio/types/components'
import type { PortableTextBlock } from '@portabletext/react'

import { ComponentLayout } from '@/components/hoc/ComponentLayout'
import { Heading } from '@/components/atoms/Heading/Heading'
import FaqItem from '@/components/molecules/FaqItem/FaqItem'
import { makeComponentId } from '@/utils/makeComponentId'
import { cn } from '@/utils/cn'
import { StaggerChildren } from '@/components/animation/StaggerChildren/StaggerChildren'
import JsonLdSchema from '@/components/atoms/JsonLdSchema/JsonLdSchema'
import type { FAQPageSchema } from '@/types/json-schema'

const extractText = (blocks?: PortableTextBlock[]): string =>
  blocks
    ?.flatMap(block => block.children?.map(span => span.text) ?? [])
    .filter(Boolean)
    .join(' ')
    .trim() ?? ''

// Figma annotations:
// - FAQ list card (node-id: 75:1735)
// - FAQ list with left title + right card (node-id: 3594:2406)
// - Accordion state uses native <details>/<summary>

const Faqs = ({
  _id,
  _key,
  title,
  questions,
  sectionId,
  componentIndex,
}: FaqsComponent) => {
  const locale = useLocale()
  const headingText = title?.heading
  const hasHeading = Boolean(headingText)
  const hasQuestions = Boolean(questions && questions.length)
  const headingId = makeComponentId({
    value: _id ?? _key ?? headingText,
    prefix: 'faqs',
  })

  if (!hasHeading && !hasQuestions) {
    return null
  }

  const validQuestions = questions?.filter(q => q.question) ?? []
  const faqSchema: FAQPageSchema | null = validQuestions.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: validQuestions.map(q => ({
          '@type': 'Question' as const,
          name: q.question!,
          acceptedAnswer: {
            '@type': 'Answer' as const,
            text: extractText(q.answer),
          },
        })),
      }
    : null

  const cardColumnClassName = cn(
    hasHeading && 'md:col-span-8',
    hasHeading && 'md:col-start-5',
    !hasHeading && 'md:col-span-10 md:col-start-2',
    !hasHeading && 'lg:col-span-8 lg:col-start-3'
  )

  return (
    <>
      {faqSchema && (
        <JsonLdSchema
          id={`faq-ld-${_key ?? _id ?? 'default'}`}
          schema={faqSchema}
        />
      )}
      <ComponentLayout
        sectionId={sectionId}
        componentKey={_key}
        componentIndex={componentIndex}
        {...(hasHeading && headingId && { 'aria-labelledby': headingId })}
        className={'text-black dark:text-foreground'}
        contentClassName="gap-y-10"
        data-organism="faqs"
        data-figma-node-id="75:1735"
      >
        {hasHeading && headingText && (
          <Heading
            id={headingId}
            level={title?.headingLevel}
            className="max-w-sm font-heading text-heading-2 font-medium tracking-tight md:col-span-4"
          >
            {headingText}
          </Heading>
        )}

        {hasQuestions && questions && (
          <StaggerChildren
            className={cn(
              cardColumnClassName,
              'min-w-0 divide-y divide-black/10 p-6 md:p-0'
            )}
          >
            {questions.map((item, index) => (
              <FaqItem
                key={item._key ?? `faq-${index}`}
                _key={item._key}
                question={item.question}
                answer={item.answer}
                {...(index === 0 && { className: '[&>button]:pt-0' })}
              />
            ))}
          </StaggerChildren>
        )}
      </ComponentLayout>
    </>
  )
}

export default Faqs
export { Faqs }
