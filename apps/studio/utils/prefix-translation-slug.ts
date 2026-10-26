import type { PluginCallbackArgs } from '@sanity/document-internationalization'
import { isLocale, localiseSlug } from '@portfolio/utils/locale'

const readSlug = (document: Record<string, unknown>): string | undefined => {
  const slug = document.slug

  if (slug === null || typeof slug !== 'object') {
    return undefined
  }

  const current = (slug as Record<string, unknown>).current

  return typeof current === 'string' && current.length > 0 ? current : undefined
}

/**
 * Runs after the translation plugin creates a new language version.
 *
 * The plugin is told not to copy `slug` (it would clash with the source and
 * lack the locale prefix), so the new draft starts without one. This gives it
 * the source's path under the destination locale — `journals/foo` becomes
 * `it/journals/foo`, the homepage `/` becomes `it` — which the editor can then
 * rename into the target language.
 */
export const prefixTranslationSlug = async ({
  client,
  sourceDocument,
  newDocument,
  destinationLanguageId,
}: PluginCallbackArgs): Promise<void> => {
  const sourceSlug = readSlug(sourceDocument)

  if (!sourceSlug || !isLocale(destinationLanguageId)) {
    return
  }

  await client
    .patch(newDocument._id)
    .set({
      slug: {
        _type: 'slug',
        current: localiseSlug(sourceSlug, destinationLanguageId),
      },
    })
    .commit()
}
