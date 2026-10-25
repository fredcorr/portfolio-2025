import { defineConfig, type WorkspaceOptions } from 'sanity'
import { dashboardTool } from '@sanity/dashboard'
import { presentationTool } from 'sanity/presentation'
import { locate } from './presentation/locate'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'
import { lucideIconPicker } from '@fredcorr/sanity-plugin-lucide-icon-picker'
import { media } from 'sanity-plugin-media'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import structure from './structure'
import { SINGLETON_ACTIONS, SINGLETON_TYPES } from './constants'
import { dashboardWidgets } from './dashboard'
import { Locale, PageTypeName, SanityDataset } from '@portfolio/types/base'
import { documentInternationalization } from '@sanity/document-internationalization'
import {
  withI18nFields,
  LANGUAGE_FIELD,
} from './schemas/compositions/i18n-fields'
import { prefixTranslationSlug } from './utils/prefix-translation-slug'
import { DeleteTranslationAction } from './utils/delete-translation-action'
import { filterGlobalTemplatesForI18n } from './utils/i18n-new-document-options'

if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID environment variable')
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID

const stripTrailingSlash = (url: string) => url.replace(/\/$/, '')

const developPreviewUrl = stripTrailingSlash(
  process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
)

// Prod previews point at the live site. Falls back to the develop preview URL
// so a local Studio without the extra var still loads.
const prodPreviewUrl = stripTrailingSlash(
  process.env.SANITY_STUDIO_PREVIEW_URL_PROD ||
    process.env.SANITY_STUDIO_PREVIEW_URL ||
    'http://localhost:3000'
)

interface StudioWorkspaceOptions {
  name: string
  title: string
  basePath: string
  dataset: SanityDataset
  previewUrl: string
  /**
   * Document-level translations (English / Italian). Off by default so a
   * workspace only gains the plugin, the `language` field and the per-locale
   * structure once it is opted in — the one Studio deployment serves every
   * workspace, so without this a translation created under `/prod` on a
   * preview deploy would write to the prod dataset.
   */
  i18n?: boolean
}

const TRANSLATABLE_TYPES: string[] = Object.values(PageTypeName)

/**
 * Both workspaces share every plugin, schema and document rule — only the
 * dataset, the preview target and whether translations are enabled differ.
 */
const createWorkspace = ({
  name,
  title,
  basePath,
  dataset,
  previewUrl,
  i18n = false,
}: StudioWorkspaceOptions): WorkspaceOptions => ({
  name,
  title,
  basePath,

  projectId,
  dataset,

  plugins: [
    // The dashboard must stay first so Studio opens with operational context.
    dashboardTool({
      widgets: dashboardWidgets,
    }),
    presentationTool({
      resolve: { locations: locate },
      previewUrl: {
        initial: previewUrl,
        previewMode: {
          // Absolute, and built from this workspace's own previewUrl. The
          // Studio and the site are separate origins, so a relative path would
          // resolve against the Studio; a URL fixed to one workspace's site
          // would enable draft mode on the wrong deployment, which reads the
          // wrong dataset.
          enable: `${previewUrl}/api/draft`,
        },
      },
    }),
    structureTool({
      structure: (S, context) => structure(S, context, { i18n }),
    }),
    ...(i18n
      ? [
          documentInternationalization({
            supportedLanguages: [
              { id: Locale.English, title: 'English' },
              { id: Locale.Italian, title: 'Italiano' },
            ],
            schemaTypes: TRANSLATABLE_TYPES,
            languageField: LANGUAGE_FIELD,
            callback: prefixTranslationSlug,
          }),
        ]
      : []),
    lucideIconPicker(),
    media(),
    unsplashImageAsset(),
  ],

  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        if (i18n) {
          return filterGlobalTemplatesForI18n(prev)
        }

        return prev.filter(
          template => !SINGLETON_TYPES.has(template.templateId || '')
        )
      }
      return prev
    },
    actions: (prev, context) => {
      // Deleting a translation through the plugin's action also removes it
      // from its translation.metadata document; the stock delete would leave
      // the metadata pointing at nothing.
      const withTranslationActions =
        i18n && TRANSLATABLE_TYPES.includes(context.schemaType)
          ? [...prev, DeleteTranslationAction]
          : prev

      if (context.schemaType && SINGLETON_TYPES.has(context.schemaType)) {
        return withTranslationActions.filter(
          actionItem =>
            actionItem.action && SINGLETON_ACTIONS.has(actionItem.action)
        )
      }
      return withTranslationActions
    },
  },

  schema: {
    types: i18n ? withI18nFields(schemaTypes) : schemaTypes,
  },
})

export default defineConfig([
  createWorkspace({
    name: SanityDataset.Develop,
    title: 'Portfolio Studio — Develop',
    basePath: '/develop',
    dataset: SanityDataset.Develop,
    previewUrl: developPreviewUrl,
    i18n: true,
  }),
  createWorkspace({
    name: SanityDataset.Prod,
    title: 'Portfolio Studio — Production',
    basePath: '/prod',
    dataset: SanityDataset.Prod,
    previewUrl: prodPreviewUrl,
  }),
])
