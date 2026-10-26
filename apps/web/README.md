# Portfolio Web App

A modern Next.js web application with TypeScript, Tailwind CSS, and Sanity CMS integration.

## Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Sanity CMS** integration with preview mode
- ✅ **ESLint** with Prettier configuration
- ✅ **Atomic Design** structure for components
- ✅ **Catch-all routing** for dynamic pages
- ✅ **Draft Mode API** for content preview

## Getting Started

### Prerequisites

- Node.js v20.19 or higher
- npm or pnpm

### Installation

1. Copy the environment variables template:

```bash
cp .env.example .env.local
```

2. Fill in your Sanity credentials in `.env.local`:

```
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=develop
SANITY_API_READ_TOKEN=your_read_token
SANITY_STUDIO_PREVIEW_SECRET=your_secret_here
```

All Sanity access is server-side, so none of these use the `NEXT_PUBLIC_`
prefix. `SANITY_DATASET` is what points the site at `develop` or `prod` — see
the root README → _Environments & datasets_.

3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
apps/web/
├── app/                     # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── draft/           # Draft mode API
│   │   └── disable-draft/
│   ├── [locale]/            # One tree per locale (en unprefixed via proxy.ts)
│   │   ├── [[...slug]]/     # Catch-all CMS route
│   │   └── layout.tsx       # Root layout (<html lang>)
│   └── globals.css          # Global styles
├── components/              # Atomic design structure
│   ├── atoms/               # Basic building blocks
│   ├── molecules/           # Simple component groups
│   ├── organisms/           # Complex component sections
│   └── templates/           # Page-level templates
├── sanity/                  # Sanity CMS integration
│   ├── client.ts            # Sanity clients
│   ├── queries.ts           # GROQ queries
│   ├── image.ts             # Image URL builder
│   └── config.ts            # Sanity configuration
├── utils/                   # Helper functions
│   ├── cn.ts                # Class name utility
│   └── index.ts             # Utility exports
├── global.d.ts              # Global type declarations
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.json          # ESLint configuration
└── package.json             # Dependencies and scripts
```

## Atomic Design Structure

This project follows the Atomic Design methodology:

- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple component groups (form fields, card headers)
- **Organisms**: Complex component sections (navigation, forms, cards)
- **Templates**: Page-level layout templates

## Sanity Integration

### Draft Mode

To preview draft content from Sanity:

1. Visit: `/api/draft?secret=YOUR_SECRET&slug=your-page-slug`
2. This enables draft mode and redirects to the page
3. Exit draft mode by clicking the banner link or visiting: `/api/disable-draft`

### Queries

All Sanity queries are located in `sanity/queries.ts`. Modify these based on your schema.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Environment Variables

Required environment variables:

| Variable                       | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `SANITY_PROJECT_ID`            | Your Sanity project ID                        |
| `SANITY_DATASET`               | Dataset to read from — `develop` or `prod`    |
| `SANITY_API_READ_TOKEN`        | Sanity read token for preview mode            |
| `SANITY_STUDIO_PREVIEW_SECRET` | Secret key for draft mode authentication      |
| `SANITY_STUDIO_URL`            | Studio origin used for stega/visual editing   |
| `SANITY_REVALIDATE_SECRET`     | Signing secret for the Sanity publish webhook |

`SANITY_DATASET` is validated against the `SanityDataset` enum in
`shared/types/base.ts` at module load, so an unknown value fails the build
instead of silently returning no content.

`SANITY_REVALIDATE_SECRET` signs the webhook that invalidates cached content on
publish (`/api/revalidate`). Give the Production and Preview environments
**different** values: each dataset gets its own webhook pointed at its own
deployment, and the differing secret is what stops a `develop` publish from
being accepted by production. Without this variable the route returns 500 and
pages only refresh on the one-hour `cacheLife` timer. See
`docs/cache-components-migration.md` for the webhook setup.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
