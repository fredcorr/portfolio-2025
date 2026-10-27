import * as yup from 'yup'
import type { FormFieldItem } from '@portfolio/types/components/form'
import {
  FormFieldType,
  FormValidationType,
} from '@portfolio/types/components/form'
import camelCase from '@/utils/camel-case'

export const buildInitialValues = (
  fields?: FormFieldItem[]
): Record<string, string | boolean> => {
  if (!fields || fields.length === 0) return {}

  return fields.reduce<Record<string, string | boolean>>((acc, field) => {
    const key = camelCase(field.label)
    const isCheckbox = field.type === FormFieldType.Checkbox
    acc[key] = isCheckbox ? false : ''
    return acc
  }, {})
}

/**
 * Fallback validation messages, in the page's language. A field's own
 * `errorMessage` from the CMS still wins when it is set.
 */
export interface ValidationMessages {
  required: string
  invalidEmail: string
  invalidFormat: string
  invalidDate: string
  selectOption: string
}

const getErrorMessage = (field: FormFieldItem, fallback: string) =>
  field.errorMessage?.trim() || fallback

export const buildValidationSchema = (
  fields: FormFieldItem[] | undefined,
  messages: ValidationMessages
) => {
  if (!fields || fields.length === 0) return yup.object().shape({})

  const shape = fields.reduce<Record<string, yup.AnySchema>>((acc, field) => {
    const key = camelCase(field.label)

    if (field.type === FormFieldType.Checkbox) {
      let checkboxSchema: yup.BooleanSchema<boolean | undefined> = yup.boolean()

      if (field.required) {
        checkboxSchema = checkboxSchema.oneOf(
          [true],
          getErrorMessage(field, messages.required)
        )
      }

      acc[key] = checkboxSchema
      return acc
    }

    let validator: yup.StringSchema<string | undefined> = yup.string().trim()

    if (field.validation?.type === FormValidationType.Email) {
      validator = validator.email(getErrorMessage(field, messages.invalidEmail))
    }

    if (field.validation?.type === FormValidationType.Regex) {
      const pattern = field.validation.pattern
      if (pattern) {
        validator = validator.matches(
          new RegExp(pattern),
          getErrorMessage(field, messages.invalidFormat)
        )
      }
    }

    if (field.validation?.type === FormValidationType.Date) {
      validator = validator.matches(
        /^\d{4}-\d{2}-\d{2}$/,
        getErrorMessage(field, messages.invalidDate)
      )
    }

    if (field.type === FormFieldType.Select && field.required) {
      validator = validator.required(
        getErrorMessage(field, messages.selectOption)
      )
    }

    if (field.required) {
      validator = validator.required(getErrorMessage(field, messages.required))
    }

    acc[key] = validator
    return acc
  }, {})

  return yup.object().shape(shape)
}
