import {
  defineField,
  type FieldDefinition,
  type Rule,
  type SchemaTypeDefinition,
  type SlugifierFn,
  type SlugValue,
} from 'sanity'
import { DEFAULT_LOCALE, Locale, PageTypeName } from '@portfolio/types/base'
import {
  isLocale,
  localePrefix,
  localiseSlug,
  slugMatchesLocale,
} from '@portfolio/utils/locale'
import { baseDocumentFieldset } from '../fieldsets'

/**
 * Document-level internationalisation for page types.
 *
 * Applied as a transform over the finished schema rather than baked into each
 * page definition, so a workspace that does not opt in keeps a byte-identical
 * schema. See `i18n` in `sanity.config.ts`.
 */

export const LANGUAGE_FIELD = 'language'

const TRANSLATABLE_TYPES: ReadonlySet<string> = new Set<string>(
  Object.values(PageTypeName)
)

/**
 * Fields the translation plugin must not copy into a new translation.
 *
 * The plugin duplicates every field of the source document. These would be
 * wrong on a translation:
 * - `slug` — would clash with the source and lack the locale prefix; the
 *   plugin callback sets a localised one instead.
 * - `editionNumber` — belongs to the original article.
 * - The syndication fields — `devtoArticleId` in particular makes the Dev.to
 *   function update the *source's* Dev.to post with the translated content.
 */
const TRANSLATION_EXCLUDED_FIELDS: ReadonlySet<string> = new Set([
  'slug',
  'editionNumber',
  'mediumPublishedUrl',
  'devtoSyndicate',
  'devtoPublishedUrl',
  'devtoArticleId',
])

/**
 * A document with no `language` predates localisation and is English. The
 * plugin lets an editor set it per document, so nothing needs backfilling.
 */
export const documentLocale = (document: unknown): Locale => {
  const language =
    document !== null && typeof document === 'object'
      ? (document as Record<string, unknown>)[LANGUAGE_FIELD]
      : undefined

  return isLocale(language) ? language : DEFAULT_LOCALE
}

const defaultSlugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s/_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

const languageField = defineField({
  name: LANGUAGE_FIELD,
  title: 'Language',
  type: 'string',
  fieldset: baseDocumentFieldset.name,
  hidden: true,
  readOnly: true,
  // No initial value on purpose: a new document's language is chosen from its
  // Translations menu, and until then it counts as English (`documentLocale`).
})

type SlugFieldDefinition = Extract<FieldDefinition, { type: 'slug' }>

const isSlugField = (field: FieldDefinition): field is SlugFieldDefinition =>
  field.type === 'slug'

const excludeFromTranslation = (field: FieldDefinition): FieldDefinition => ({
  ...field,
  options: {
    ...(typeof field.options === 'object' ? field.options : {}),
    documentInternationalization: { exclude: true },
  },
})

const slugLocaleMessage = (locale: Locale) =>
  locale === DEFAULT_LOCALE
    ? 'English slugs must not start with a locale prefix.'
    : `Slugs for this language must start with "${localePrefix(locale)}/" (or be "${localePrefix(locale)}" for the homepage).`

const localiseSlugField = (field: SlugFieldDefinition): SlugFieldDefinition => {
  // Fail at schema build rather than silently drop a rule: this replaces the
  // slug's validation, and no page schema sets one today.
  if (field.validation) {
    throw new Error(
      `i18n-fields: slug field "${field.name}" already has validation; compose it with the locale rule before enabling i18n.`
    )
  }

  const baseSlugify: SlugifierFn =
    field.options?.slugify ?? (source => defaultSlugify(source))

  const slugify: SlugifierFn = async (source, schemaType, context) =>
    localiseSlug(
      await baseSlugify(source, schemaType, context),
      documentLocale(context.parent)
    )

  return {
    ...field,
    options: { ...field.options, slugify },
    validation: (rule: Rule) =>
      rule.custom<SlugValue | undefined>((value, context) => {
        const current = value?.current

        if (!current) {
          return true
        }

        const locale = documentLocale(context.document)

        return slugMatchesLocale(current, locale) || slugLocaleMessage(locale)
      }),
  }
}

const localiseField = (field: FieldDefinition): FieldDefinition => {
  const localised = isSlugField(field) ? localiseSlugField(field) : field

  return TRANSLATION_EXCLUDED_FIELDS.has(field.name)
    ? excludeFromTranslation(localised)
    : localised
}

/**
 * Adds the `language` field, locale-aware slugs and translation exclusions to
 * every page type; leaves every other type untouched.
 */
export const withI18nFields = (
  types: SchemaTypeDefinition[]
): SchemaTypeDefinition[] =>
  types.map(type => {
    if (
      type.type !== 'document' ||
      !TRANSLATABLE_TYPES.has(type.name) ||
      !('fields' in type) ||
      !type.fields
    ) {
      return type
    }

    const fields = type.fields.map(localiseField)
    const slugIndex = fields.findIndex(field => field.name === 'slug')

    fields.splice(slugIndex + 1, 0, languageField)

    return { ...type, fields }
  })
