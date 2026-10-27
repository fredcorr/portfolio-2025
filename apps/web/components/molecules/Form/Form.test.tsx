import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { withIntl } from '@/test-utils/with-intl'

import Form from './Form'
import {
  type FormFieldItem,
  FormFieldType,
  FormValidationType,
} from '@portfolio/types/components/form'
import type { PortableTextBlock } from '@portabletext/react'

const fields: FormFieldItem[] = [
  {
    _key: 'name',
    label: 'Name',
    type: FormFieldType.Input,
    required: true,
  },
  {
    _key: 'email',
    label: 'Email',
    type: FormFieldType.Input,
    validation: { type: FormValidationType.Email },
  },
  {
    _key: 'interest',
    label: 'Interest',
    type: FormFieldType.Select,
    options: [
      { label: 'Design', value: 'design' },
      { label: 'Development', value: 'development' },
    ],
    required: true,
  },
] as const

const richTextBlock = (text: string): PortableTextBlock[] => [
  {
    _key: `${text}-block`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _key: `${text}-span`, _type: 'span', text, marks: [] }],
  },
]

test('renders provided fields and submit label', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Form
        fields={fields}
        submitLabel="Send message"
        success={{ title: 'Success', subtitle: richTextBlock('Thanks!') }}
        error={{ title: 'Error', subtitle: richTextBlock('Try again') }}
      />
    )
  )

  assert.match(markup, /Name/)
  assert.match(markup, /Email/)
  assert.match(markup, /Interest/)
  assert.match(markup, /Send message/)
})

test('does not render modal content while idle', () => {
  const markup = renderToStaticMarkup(
    withIntl(
      <Form
        fields={fields}
        success={{ title: 'Success', subtitle: richTextBlock('Done') }}
        error={{ title: 'Error', subtitle: richTextBlock('Oops') }}
      />
    )
  )

  assert.ok(!markup.includes('Success'))
  assert.ok(!markup.includes('Error'))
})
