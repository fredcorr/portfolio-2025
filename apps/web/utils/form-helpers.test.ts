import assert from 'node:assert/strict'
import test from 'node:test'
import { FormFieldType } from '@portfolio/types/components/form'
import type { FormFieldItem } from '@portfolio/types/components/form'

import it from '@/messages/it.json'
import { buildValidationSchema } from './form-helpers'

const messages = {
  required: it.form.required,
  invalidEmail: it.form.invalidEmail,
  invalidFormat: it.form.invalidFormat,
  invalidDate: it.form.invalidDate,
  selectOption: it.form.selectOption,
}

const field = (overrides: Partial<FormFieldItem>): FormFieldItem =>
  ({ label: 'Name', type: FormFieldType.Input, ...overrides }) as FormFieldItem

test('falls back to the page-language message', async () => {
  const schema = buildValidationSchema([field({ required: true })], messages)

  await assert.rejects(schema.validate({ name: '' }), {
    message: 'Campo obbligatorio',
  })
})

test("the CMS field's own error message still wins", async () => {
  const schema = buildValidationSchema(
    [field({ required: true, errorMessage: 'Dimmi il tuo nome' })],
    messages
  )

  await assert.rejects(schema.validate({ name: '' }), {
    message: 'Dimmi il tuo nome',
  })
})
