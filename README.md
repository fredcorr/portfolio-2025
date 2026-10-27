# Portfolio 2025

A high-performance monorepo portfolio project powered by Turborepo with Sanity CMS and Next.js.

## Project Structure

```
portfolio-2025/
├── apps/
│   ├── studio/       # Sanity Studio (CMS)
│   └── web/          # Web application (to be set up)
├── shared/
│   ├── config/       # Shared configuration files
│   │   ├── .prettierrc.json
│   │   └── .prettierignore
│   └── types/        # Shared TypeScript types
│       ├── index.ts
│       └── sanity.ts
└── package.json      # Root workspace configuration
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup

One env file per app, loaded natively by that app's framework. There is no
root `.env` and nothing is derived or generated.

#### Structure
```
Portfolio-2025/
└── apps/
    ├── web/
    │   ├── .env.local            # Web variables (gitignored)
    │   └── .env.example
    └── studio/
        ├── .env                  # Studio variables (gitignored)
        └── .env.example
```

Next.js loads `apps/web/.env*` and Vite loads `apps/studio/.env*` themselves —
neither reads anything above its own directory.

#### Initial Setup

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/studio/.env.example apps/studio/.env
```

Fill in both. The project ID appears in each file, once as
`SANITY_PROJECT_ID` and once as `SANITY_STUDIO_PROJECT_ID`: Vite strips any
variable without the `SANITY_STUDIO_` prefix out of the Studio bundle, so the
same value genuinely has to exist under both names.

### 3. Run Development Server

```bash
# Start all apps
npm run dev

# Or start individual apps
npm run dev:web      # Web app only
npm run dev:studio   # Studio only
```

**Switching the dataset.** The Studio serves both at once — pick `Develop` or
`Production` from the workspace dropdown in the navbar, no restart needed. The
web app reads one dataset at a time, set by `SANITY_DATASET` in
`apps/web/.env.local`. To point it at prod for a single run without editing the
file:

```bash
SANITY_DATASET=prod npm run dev:web
```

That works because `SANITY_DATASET` is declared on the `dev` task in
`turbo.json`. Turbo runs in strict env mode, so an undeclared variable is
stripped before the task sees it — if you add another variable you want to
override inline, declare it there too.

## Workspaces

This project uses npm workspaces with Turborepo to manage the monorepo:

- **apps/studio**: Sanity Studio with TypeScript support
- **apps/web**: Next.js web application with Tailwind CSS
- **shared/types**: Shared TypeScript types used across all apps
- **shared/config**: Shared configuration files (Prettier, etc.)

## Turborepo

This monorepo uses [Turborepo](https://turbo.build/repo) for:
- **Parallel execution**: Run tasks across multiple apps simultaneously
- **Smart caching**: Cache build outputs to speed up subsequent builds
- **Task orchestration**: Manage dependencies between tasks automatically

## Shared Configuration

### Prettier

The project uses a shared Prettier configuration located in `shared/config/.prettierrc.json`. All apps reference this configuration.

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### TypeScript Types

Shared TypeScript types are maintained in `shared/types/` and can be imported using the `@portfolio/types` package name in any workspace.

## Development

### Run All Apps
- **Start all apps**: `npm run dev`
- **Build all apps**: `npm run build`

### Run Individual Apps
- **Start web app**: `npm run dev:web`
- **Start Sanity Studio**: `npm run dev:studio`
- **Build web app**: `npm run build:web`
- **Build Sanity Studio**: `npm run build:studio`

### Code Quality
- **Lint all apps**: `npm run lint`
- **Format all files**: `npm run format`
- **Check formatting**: `npm run format:check`

### Turbo Commands
You can also use turbo directly for more control:
```bash
# Run with filtered packages
npx turbo run build --filter=web
npx turbo run dev --filter=studio

# Clear turbo cache
npx turbo clean

# View task graph
npx turbo run build --graph
```

## Environment Variables

### Adding New Variables

Turbo's `env` arrays control **cache hashing and which variables are passed
through to the task process** — they have nothing to do with what ends up in a
JavaScript bundle. Bundling is decided by the framework: Next.js only inlines
`NEXT_PUBLIC_`-prefixed variables, Vite only exposes `SANITY_STUDIO_`-prefixed
ones. `SANITY_API_READ_TOKEN` is declared in `web#build.env` and still never
leaves the server.

**Never add a variable to `globalEnv`.** It is deliberately empty. `globalEnv`
is the *broader* setting — it applies to every task in every package, so
rotating a Studio-only secret would bust the web app's build cache and force a
needless rebuild. The per-package `env` array is strictly narrower.

```jsonc
// turbo.json
"web#build":    { "env": ["MY_NEW_WEB_VAR"] },    // only busts the web cache
"studio#build": { "env": ["MY_NEW_STUDIO_VAR"] }  // only busts the studio cache
```

1. Add the variable to the right app's `.env.local` / `.env` and its
   `.env.example`.
2. Add it to the correct `web#build` / `studio#build` `env` array.
3. Add it to the hosting provider for each environment that needs it.

`lint`, `typecheck` and `test` don't need entries — they don't vary by env var.
`dev` is uncached, but it still needs an entry for any variable you expect to
override inline on the command line, because strict mode strips undeclared
variables.

### Variable Naming Conventions

- **Next.js (web app)**: all Sanity access is server-side, so use unprefixed
  names. `NEXT_PUBLIC_` is only for values that genuinely must reach the
  browser (currently the GTM ID, contact email and reCAPTCHA site key).
  ```typescript
  const projectId = process.env.SANITY_PROJECT_ID   // server-side only
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID      // shipped to the browser
  ```

- **Sanity Studio**: must use the `SANITY_STUDIO_` prefix — Vite strips
  anything else out of the bundle.
  ```typescript
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID
  ```

### Troubleshooting

**Variables not loading?**
1. Restart dev server (`npm run dev`)
2. Check variable names match exactly (case-sensitive), including the
   `SANITY_STUDIO_` / `NEXT_PUBLIC_` prefixes
3. Verify the file is in the app's own directory — `apps/web/.env.local` or
   `apps/studio/.env`
4. Ensure no spaces around `=` in `.env` files

**Studio says "Missing SANITY_STUDIO_PROJECT_ID"?**
`apps/studio/.env` is missing or doesn't set it. Copy
`apps/studio/.env.example` and fill it in — the Studio does not read
`apps/web/.env.local` or anything above its own directory.

**Set a variable inline and the app didn't see it?**
Turbo runs in strict env mode and drops variables that aren't declared for the
task. Add it to that task's `env` array in `turbo.json` (this is why `dev`
declares `SANITY_DATASET`).

**Web build fails with `Unknown SANITY_DATASET "…"`?**
The dataset name is validated against the `SanityDataset` enum in
`shared/types/base.ts`. Fix the typo, or add the dataset to that enum if it is
genuinely new (see _Adding a dataset_ below).

## Environments & datasets

The Sanity project has two datasets. Schema and code are shared; only content
differs.

| | `develop` | `prod` |
| --- | --- | --- |
| Purpose | Working dataset — drafts, experiments, schema changes | Content behind the live site |
| Web (`SANITY_DATASET`) | Local dev, Vercel Preview + Development | Vercel Production |
| Studio | `/develop` workspace | `/prod` workspace |
| Sanity CLI | Default target | Requires an explicit `--dataset prod` |
| Safe to break? | Yes | No — export a backup first |

**Where dataset names live.** Exactly one place: the `SanityDataset` enum in
`shared/types/base.ts`. `apps/studio/sanity.config.ts` builds one workspace per
value, and `apps/web/sanity/client.ts` validates `SANITY_DATASET` against it.

**Studio workspaces.** `sanity.config.ts` exports an array of two workspaces
rather than a single config, so one deployed Studio serves both datasets and
you switch between them with the workspace dropdown in the navbar — no
restart, no env change. URLs are namespaced accordingly
(`/develop/structure`, `/prod/structure`); `/` redirects to `develop`.

**Sanity Functions.** `sanity.blueprint.ts` deploys project-wide, not
per-dataset. The `syndicate-devto` filter is therefore scoped with
`sanity::dataset() == "prod"` — without that, publishing the same article in
both datasets would post to Dev.to twice. Any new function needs the same
guard.

### Adding a dataset

1. Create it: `npx sanity datasets create <name>`
2. Add a value to `SanityDataset` in `shared/types/base.ts`
3. Add a workspace to `apps/studio/sanity.config.ts`

That's it — the Studio dropdown picks it up automatically, and the web app
accepts it as a valid `SANITY_DATASET`.

## Migrating between datasets

### What actually gets promoted

The schema lives in code (`apps/studio/schemas/`), not in the dataset — so
"promoting a schema to prod" means deploying the same Studio build and pointing
the web app at the other dataset. There is no schema to copy between datasets.

Two things *are* stored per dataset and do need promoting:

- **Content** — documents and assets.
- **The schema manifest** — the JSON description of your types that Sanity's
  schema-aware tooling (Presentation, agent actions, the MCP server) reads.
  Deployed with `sanity schemas deploy`, per dataset.

### Order of operations

Run every step against `develop` first, verify, then repeat against `prod`.

1. **Change the schema.** Follow the cross-workspace checklist in `CLAUDE.md`:
   `ComponentTypeName` enum → Studio schema → `shared/types` → GROQ fragment →
   organism → `RenderOrganism` case.
2. **Verify on develop:** `npm run dev`, then
   `turbo run lint typecheck build`.
3. **Migrate develop's content** if the change is not backwards compatible
   (renamed or removed fields) — see _Content migrations_ below.
4. **Back up prod:** `npx sanity datasets export prod ./backup-<date>.tar.gz`
5. **Deploy the Studio:** `npm run build:studio && npx sanity deploy`
   (from `apps/studio`). One deploy covers both workspaces.
6. **Deploy the schema manifest to prod:**
   `npx sanity schemas deploy --workspace prod --dataset prod`
7. **Run the same content migration against prod** (dry run first).
8. **Deploy the web app** with `SANITY_DATASET=prod`.
9. **Deploy functions** if `sanity.blueprint.ts` changed:
   `npx sanity blueprints deploy`

### Seeding prod from develop

`prod` starts empty. To copy develop's content into it the first time — run
from `apps/studio`, after `npx sanity login`:

```bash
npx sanity datasets export develop ~/develop-backup.tar.gz
npx sanity datasets import ~/develop-backup.tar.gz --dataset prod
```

Write the tarball outside the repo — `*.tar.gz` is not gitignored.

> Note: `sanity datasets copy` looks like the obvious tool here, but it is part
> of Sanity's advanced dataset management tier and is not available on this
> project's plan. Export/import is the supported path.

A plain import is correct for an empty target. `--replace` overwrites documents
with matching IDs and should be kept away from a populated prod. For later
top-ups use `--missing`, which adds documents that don't exist in the target and
leaves existing ones alone:

```bash
npx sanity datasets import ./develop.tar.gz --dataset prod --missing
```

Exports include assets by default; add `--no-assets` for a documents-only
export when you just want to compare shapes.

Verify afterwards:
```bash
npx sanity documents query 'count(*[!(_id in path("_.**"))])' --dataset prod
```

### Content migrations

For field renames, type changes or backfills — anything that transforms
existing documents — use the migration tooling rather than export/import:

```bash
npx sanity migrations create rename-hero-field   # scaffolds under migrations/
npx sanity migrations run rename-hero-field --dataset develop            # dry run
npx sanity migrations run rename-hero-field --dataset develop --no-dry-run
npx sanity migrations run rename-hero-field --dataset prod               # dry run
npx sanity migrations run rename-hero-field --dataset prod --no-dry-run
```

`migration run` is a dry run unless you pass `--no-dry-run`. Read the dry-run
diff before committing to prod.

### Rules of thumb

- `develop` is the only dataset safe to experiment in.
- Never `import --replace` into prod after the initial seed — it will
  overwrite live content.
- Export prod before any destructive migration.
- The CLI defaults to `develop` (`apps/studio/sanity.cli.ts`), so a forgotten
  `--dataset` flag is harmless. Pass `--dataset prod` deliberately.

### CORS

Visual editing needs each site origin registered on the project:

```bash
npx sanity cors add https://your-domain.com --credentials
npx sanity cors list
```

### Making a dataset private

Both datasets are currently **public**, which means anyone who knows the
project ID can read published documents through the API. To close that:

```bash
npx sanity datasets visibility set prod private
```

Before you do, know what changes:

- `SANITY_API_READ_TOKEN` stops being optional. `apps/web/sanity/client.ts`
  currently only logs a warning when it is missing — change that to a `throw`,
  and make sure the token is set in **every** environment, including Vercel
  Preview, or those deployments will render empty.
- **Assets stay public.** Images and files served from `cdn.sanity.io` remain
  reachable by URL regardless of the dataset's ACL. A private dataset protects
  document data, not uploaded media.
- Anything else reading the dataset unauthenticated (external scripts,
  webhooks, third-party tools) breaks and needs a token.

## Deployment

### Build Commands

```bash
npm run build              # Builds all apps
npm run build:web          # Web app only
npm run build:studio       # Studio only
```

Locally these read `apps/web/.env.local` and `apps/studio/.env`. On a cloud
provider the same commands read whatever the provider injects — set the
variables there under the exact names each app expects, including the
`SANITY_STUDIO_` ones.

### Deploying to Vercel

#### 1. Configure Project Settings

**For the Web App:**
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && npx turbo run build --filter=web`
- **Output Directory**: `.next` (default)

**For Sanity Studio** (if deploying separately):
- **Framework Preset**: Other
- **Root Directory**: `apps/studio`
- **Build Command**: `cd ../.. && npx turbo run build --filter=studio`
- **Output Directory**: `dist`

#### 2. Environment Variables

Set these in Vercel's project settings → Environment Variables. **`SANITY_DATASET`
is what separates the environments — scope it per Vercel environment:**

| Variable | Production | Preview & Development |
| --- | --- | --- |
| `SANITY_DATASET` | `prod` | `develop` |
| `SITE_URL` | `https://your-domain.com` | preview URL |
| `ALLOW_CRAWLERS` | `true` | `false` |

Applied to all environments:

```bash
# Web app
SANITY_PROJECT_ID=your-project-id
SANITY_API_READ_TOKEN=your-read-token
SANITY_STUDIO_PREVIEW_SECRET=your-preview-secret
SANITY_STUDIO_URL=https://your-studio.sanity.studio

# Studio (must be set under the SANITY_STUDIO_ names — Vite strips anything
# without that prefix out of the bundle)
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_HOST=your-production-studio-url
SANITY_STUDIO_PREVIEW_URL=https://preview.your-domain.com
SANITY_STUDIO_PREVIEW_URL_PROD=https://your-domain.com
```

The Studio no longer needs `SANITY_STUDIO_DATASET` at build time — datasets are
declared per workspace in `sanity.config.ts`. It is still read by the Sanity
CLI as the default target for commands like `dataset export`.

**Important**: `SANITY_DATASET` is listed in `turbo.json` → `web#build.env`, so
changing it produces a different task hash. A dataset switch can never serve a
stale cached build.

### Deploying to Other Providers

**Netlify:**
- Build command: `cd ../.. && npx turbo run build --filter=web`
- Publish directory: `apps/web/.next`
- Set the same environment variables in Netlify's UI

**Cloudflare Pages:**
- Build command: `cd ../.. && npx turbo run build --filter=web`
- Build output directory: `apps/web/.next`
- Add environment variables in Pages settings

### Monorepo Considerations

- ✅ **Build from root**: Always run `cd ../..` before build commands to ensure proper workspace resolution
- ✅ **Install at root**: Cloud providers should run `npm install` at the repository root
- ✅ **Turborepo caching**: Vercel automatically detects and uses Turbo's remote caching
- ✅ **No .env needed**: Production builds use provider-injected environment variables

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos)
