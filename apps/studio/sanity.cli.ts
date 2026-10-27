import { resolve } from 'node:path'
import { defineCliConfig } from 'sanity/cli'
import { SanityDataset } from '@portfolio/types/base'

const KNOWN_DATASETS = Object.values(SanityDataset)
const dataset = process.env.SANITY_STUDIO_DATASET || SanityDataset.Develop

// `sanity build` bundles sanity.config.ts without running it, so its dataset
// check would only surface in the browser. This file does run at build and
// deploy time, so a typo fails here instead of shipping a broken Studio.
if (!KNOWN_DATASETS.includes(dataset as SanityDataset)) {
  throw new Error(
    `Unknown SANITY_STUDIO_DATASET "${dataset}" — expected one of: ${KNOWN_DATASETS.join(', ')}`
  )
}

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    // The same variable picks the Studio's single dataset in sanity.config.ts,
    // so the CLI and the deployed Studio always agree. It defaults to develop
    // so an unset env can never point a destructive command at prod — pass
    // `--dataset prod` explicitly instead.
    dataset,
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
