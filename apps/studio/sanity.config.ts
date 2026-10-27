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
import { NavbarWithLocaleSwitch } from './components/studio-locale-switch'

if (!process.env.SANITY_STUDIO_PROJECT_ID) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID environment variable')
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID

const KNOWN_DATASETS = Object.values(SanityDataset)

// Each deployment serves exactly one dataset, picked per Vercel environment
// (prod on studio.fred-corr.com, develop on dev.studio.fred-corr.com).
// Unset falls back to develop so nothing reaches prod without opting in.
const dataset = process.env.SANITY_STUDIO_DATASET || SanityDataset.Develop

// Fail the build on a typo rather than shipping a Studio that edits a dataset
// that does not exist.
if (!KNOWN_DATASETS.includes(dataset as SanityDataset)) {
  throw new Error(
    `Unknown SANITY_STUDIO_DATASET "${dataset}" — expected one of: ${KNOWN_DATASETS.join(', ')}`
  )
}

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
  dataset: SanityDataset
  previewUrl: string
  /**
   * Document-level translations (English / Italian). Off by default so a
   * dataset only gains the plugin, the `language` field and the per-locale
   * structure once it is opted in.
   */
  i18n?: boolean
}

const TRANSLATABLE_TYPES: string[] = Object.values(PageTypeName)

/**
 * Every dataset shares every plugin, schema and document rule — only the
 * dataset, the preview target and whether translations are enabled differ.
 */
const createWorkspace = ({
  name,
  title,
  dataset,
  previewUrl,
  i18n = false,
}: StudioWorkspaceOptions): WorkspaceOptions => ({
  name,
  title,
  // One workspace per deployment, so it owns the root.
  basePath: '/',

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
            // One "Create" entry per type: the plugin's per-language templates
            // would list every type twice. A new document's language is set
            // from its Translations menu instead.
            addTemplates: false,
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

  // The content-language switch that filters every document list.
  ...(i18n
    ? { studio: { components: { navbar: NavbarWithLocaleSwitch } } }
    : {}),
})

const WORKSPACES: Record<SanityDataset, StudioWorkspaceOptions> = {
  [SanityDataset.Develop]: {
    name: SanityDataset.Develop,
    title: 'Portfolio Studio — Develop',
    dataset: SanityDataset.Develop,
    previewUrl: developPreviewUrl,
    i18n: true,
  },
  [SanityDataset.Prod]: {
    name: SanityDataset.Prod,
    title: 'Portfolio Studio — Production',
    dataset: SanityDataset.Prod,
    previewUrl: prodPreviewUrl,
  },
}

export default defineConfig(
  createWorkspace(WORKSPACES[dataset as SanityDataset])
)
