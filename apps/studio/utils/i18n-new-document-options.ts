import type { TemplateItem } from 'sanity'
import { PageTypeName, SUPPORTED_LOCALES } from '@portfolio/types/base'
import { SINGLETON_TYPES } from '../constants'

/**
 * The translation plugin registers, for every translatable type `T`, one
 * template per language (`T-en`, `T-it`) plus `T-parameterized`, alongside
 * Sanity's default template whose id is just `T`. The global "Create" menu
 * should offer only the per-language ones: the default would create a
 * document whose language is implied rather than chosen, and the
 * parameterized one needs a language id typed by hand.
 *
 * Singletons are matched by schema type, not template id — matching by id
 * lets `homepage-en` through and allows a second English homepage.
 */

const PARAMETERIZED_SUFFIX = '-parameterized'

const TRANSLATABLE_TYPES: ReadonlySet<string> = new Set<string>(
  Object.values(PageTypeName)
)

interface ParsedTemplateId {
  schemaType: string
  isLanguageTemplate: boolean
}

const parseTemplateId = (templateId: string): ParsedTemplateId => {
  if (templateId.endsWith(PARAMETERIZED_SUFFIX)) {
    return {
      schemaType: templateId.slice(0, -PARAMETERIZED_SUFFIX.length),
      isLanguageTemplate: false,
    }
  }

  for (const locale of SUPPORTED_LOCALES) {
    const suffix = `-${locale}`
    const schemaType = templateId.slice(0, -suffix.length)

    if (templateId.endsWith(suffix) && TRANSLATABLE_TYPES.has(schemaType)) {
      return { schemaType, isLanguageTemplate: true }
    }
  }

  return { schemaType: templateId, isLanguageTemplate: false }
}

export const filterGlobalTemplatesForI18n = (
  templates: TemplateItem[]
): TemplateItem[] =>
  templates.filter(({ templateId }) => {
    const { schemaType, isLanguageTemplate } = parseTemplateId(templateId)

    if (SINGLETON_TYPES.has(schemaType)) {
      return false
    }

    return !TRANSLATABLE_TYPES.has(schemaType) || isLanguageTemplate
  })
