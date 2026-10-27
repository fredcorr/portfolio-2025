import { resolve } from 'node:path'
import { defineCliConfig } from 'sanity/cli'
import { SanityDataset } from '@portfolio/types/base'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    // Datasets are declared per workspace in sanity.config.ts; this only sets
    // the default target for CLI commands (dataset export, migration run,
    // schema deploy). It defaults to develop so an unset env can never point a
    // destructive command at prod — pass `--dataset prod` explicitly instead.
    dataset: process.env.SANITY_STUDIO_DATASET || SanityDataset.Develop,
  },

  vite: {
    resolve: {
      alias: [
        { find: '@schemas', replacement: resolve(__dirname, 'schemas') },
        {
          find: '@components/atoms',
          replacement: resolve(__dirname, 'schemas/components/atoms'),
        },
        {
          find: '@components/molecules',
          replacement: resolve(__dirname, 'schemas/components/molecules'),
        },
        {
          find: '@components/organisms',
          replacement: resolve(__dirname, 'schemas/components/organisms'),
        },
        {
          find: '@components/settings',
          replacement: resolve(__dirname, 'schemas/components/settings'),
        },
        {
          find: '@portfolio/types',
          replacement: resolve(__dirname, '../../shared/types'),
        },
        { find: '@studio/types', replacement: resolve(__dirname, 'types') },
        { find: '@utils', replacement: resolve(__dirname, 'utils') },
        { find: '@structure', replacement: resolve(__dirname, 'structure') },
      ],
    },
  },
  studioHost: process.env.SANITY_STUDIO_HOST,
})
