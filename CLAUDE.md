# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspaces

- `apps/web/` → Next.js application (App Router)
- `apps/studio/` → Sanity Studio v4
- `shared/types/` → Shared TypeScript types (`@portfolio/types`)
- `shared/utils/` → Shared utilities

When editing files under `apps/web/**`, also follow `apps/web/CLAUDE.md`. When editing files under `apps/studio/**`, also follow `apps/studio/CLAUDE.md`.

> **These `CLAUDE.md` files are the single source of truth for agent rules.** `AGENT.md` is only a pointer here. Do not follow stale routing to `AGENTS.md` or per-workspace `AGENT.md` files — they don't exist.

## Implementing a design (Figma / Claude Design / spec)

This is the most common source of drift, so it leads. Before writing UI from any design:

1. **Reuse before you invent.** Map every element of the design onto an existing token, atom, or molecule first. New primitives are the exception. How to discover what exists is in `apps/web/CLAUDE.md` → _Reusing components_.
2. **Tokens, not raw values.** Convert every hex/px/font from the design into its design token (`bg-primary-400`, `text-heading-1`, `font-heading`). Never paste raw values — they break dark mode. Token list is in `apps/web/CLAUDE.md` → _Design tokens_.
3. **Pull the real Figma source** (via the Figma MCP) when a node/URL is given, rather than guessing from a screenshot.

The full workflow and inventories are in `apps/web/CLAUDE.md` → _Design-to-code workflow_. Read it before implementing.

## Commands

```bash
# Dev servers
npm run dev            # both apps with TUI
npm run dev:web        # Next.js only
npm run dev:studio     # Sanity Studio only

# Quality
npm run lint           # ESLint across all workspaces
npm run format         # Prettier write
npm run format:check   # Prettier check (CI)

# Type checking
npm run typecheck      # all workspaces (turbo run typecheck)

# Build
npm run build          # all workspaces
npm run build:web
npm run build:studio

# Tests (Node's built-in test runner, run through tsx)
npm run test                                     # all workspaces with tests (turbo run test)
npx tsx --test shared/utils/makeID.test.ts       # a single file
```

> **Before considering any change complete**, run `turbo run lint typecheck build` — all must pass (strict TypeScript means zero `typecheck` errors). Also run `npm run test`: `shared/utils` is green, but the `apps/web` component suite has **known pre-existing failures** (see `apps/web/CLAUDE.md` → Testing), so don't treat a non-green test run as your regression — just don't add new failures.

## Architecture

### Data flow: schema → types → frontend

The Studio schema is the single source of truth. Changes propagate in one direction:

1. **`apps/studio/schemas/`** — defines document and component schemas
2. **`shared/types/`** — TypeScript interfaces that mirror the schema shape, published as `@portfolio/types`
3. **`apps/web/`** — imports from `@portfolio/types` for all CMS-derived data

When a Studio schema changes, update `shared/types/` accordingly. The web app must never define parallel types for CMS shapes.

### Page rendering pipeline

All pages are served through a single catch-all route `apps/web/app/[locale]/[[...slug]]/page.tsx`. `apps/web/proxy.ts` maps public URLs onto it: English is unprefixed (`/journals/foo` is rewritten to `/en/journals/foo`, and `/en/…` redirects to the unprefixed URL), while Italian keeps its prefix (`/it/journals/foo`). Sanity stores the prefixed path in `slug.current`. `toCmsSlug` / `fromCmsSlug` in `shared/utils/locale.ts` join and split it, and every language-scoped GROQ set composes `LANGUAGE_FILTER` with a `$locale` param.

1. `generateStaticParams()` pre-fetches each locale's page slugs via `ALL_PAGES_QUERY`
2. The slug resolves via `getPage(slug, locale, isDraft)`, which dispatches `PAGE_BY_SLUG_QUERY` using either `client` or `previewClient`
3. `RenderTemplate` inspects `page._type` and renders the matching template component
4. Each template iterates its component array and renders each via `RenderOrganism`, which switches on `component._type`
5. ISR is set via `revalidate` in `apps/web/app/[locale]/[[...slug]]/page.tsx` (currently `3600` seconds); draft mode bypasses the cache

### Templates vs. organisms

- **Templates** (`apps/web/components/templates/`) — full-page wrappers, one per `PageTypeName`. They receive the whole page document and iterate over the components array.
- **Organisms** (`apps/web/components/organisms/`) — individual CMS-driven sections within a page. Each maps to a `ComponentTypeName`. Every organism must wrap its output in `ComponentLayout` (from `@/components/hoc/ComponentLayout`) to get consistent padding, the 12-column grid, and section ID generation.

### Adding a new organism (cross-cutting checklist)

Adding a component type touches files in every workspace in this order:

1. **`shared/types/base.ts`** — add a value to `ComponentTypeName` enum
2. **`apps/studio/schemas/components/organisms/<name>.ts`** — define the schema; always spread `...componentFields.all` to include the `sectionId` field
3. **`apps/studio/schemas/index.ts`** — import and add to `schemaTypes`
4. **`shared/types/components/<name>.ts`** — define the TypeScript interface; export from `shared/types/components/index.ts`
5. **`apps/web/sanity/queries/components/<name>.ts`** — write the GROQ fragment; compose from `fragments.ts`
6. **`apps/web/components/organisms/<Name>/<Name>.tsx`** — implement the React component using `ComponentLayout`
7. **`apps/web/components/hoc/RenderOrganism.tsx`** — add a `case ComponentTypeName.<Name>:` branch

### GROQ query organization

Queries live in `apps/web/sanity/queries/`:

- `base.ts` — `ALL_PAGES_QUERY`, `PAGE_BY_SLUG_QUERY`, and top-level fetches
- `fragments.ts` — reusable field selections (e.g. `imageFields`, `basePageFields`)
- `pages/` — one file per page type
- `components/` — one file per component type

Always compose from fragments. Never select fields you don't use.

### Draft mode / visual editing

Two Sanity clients are defined in `apps/web/sanity/client.ts`:

- **`client`** — CDN-enabled, `perspective: 'published'`, used for all static/ISR rendering
- **`previewClient`** — no CDN, `perspective: 'drafts'`, stega encoding enabled, token-authenticated

Draft mode is activated via `/api/draft`. When `draftMode().isEnabled`, `getPage()` switches to `previewClient` and the `PreviewBanner` component is rendered above the page.

### Shared types import paths

```ts
import type { BaseDocument } from "@portfolio/types/base";
import type { SanityImage } from "@portfolio/types/sanity";
import type { CmsPages } from "@portfolio/types/pages";
import type { CardComponent } from "@portfolio/types/components/card";
```

The package is a pure TypeScript source package (no build step); `main` and `types` both point to `.ts` files resolved at compile time.

### Studio schema compositions

Reusable field groups live in `apps/studio/schemas/compositions/`:

- `component-fields.ts` — exports `componentFields.all`, which adds the `sectionId` anchor field. Spread into every organism schema.
- `seoFields.ts` — SEO meta fields shared across page schemas.
- `base-document-fields.ts` — fields common to all document types.

### Studio dashboard

Dashboard widgets live in `apps/studio/dashboard/` and are registered in `apps/studio/dashboard/index.ts`. The dashboard tool must remain the first plugin in the Studio config so Studio loads with operational context. Keep widgets lightweight — fetch only what they need.

### Environment variables (Turborepo cache scoping)

`turbo.json` uses **per-package task configs** to scope env vars to the workspace that actually consumes them. This keeps cache invalidation precise — a secret rotation in one app does not bust the other app's build cache.

**Rule: no secrets under `SANITY_STUDIO_*`.** Sanity inlines every `SANITY_STUDIO_*` variable the Studio code reads into the build, and the build is public static files. API keys, private keys, tokens, passwords and shared secrets must never use that prefix or be read in `apps/studio`. Anything needing a secret runs server-side (a route in `apps/web/app/api/` or a Sanity Function) and the Studio calls it. `apps/studio/eslint.config.mjs` fails lint on secret-looking names (`KEY|SECRET|TOKEN|PRIVATE|PASSWORD`); never disable or bypass that rule. Its `ALLOWED` list is for names the repo owner has explicitly accepted as public — only add to it when they ask.

**Rule: never add a new var to `globalEnv`.** Instead, add it to the `env` array of the correct package task:

```jsonc
// turbo.json
"web#build": {
  "env": ["MY_NEW_WEB_VAR"]   // only invalidates the web build cache
},
"studio#build": {
  "env": ["MY_NEW_STUDIO_VAR"] // only invalidates the studio build cache
}
```

**Current split:**

| Package | Task key | Owns |
|---|---|---|
| `apps/web` | `web#build` | `ALLOW_CRAWLERS`, `NEXT_PUBLIC_*`, `RECAPTCHA_*`, `MAIL_APP_ENDPOINT`, `SUBMISSION_SECRET`, `SITE_URL`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_READ_TOKEN` |
| `apps/studio` | `studio#build` | `SANITY_STUDIO_*` |

`dev` tasks have `"cache": false` so they don't need env declarations. `lint`, `typecheck`, and `test` tasks don't vary by env var, so they also don't need entries.

## General rules

- Verify claims before acting on them, including the repo owner's: check the code, official docs, or the live system (Vercel, Sanity, GitHub). If a claim is wrong, say so and show the evidence instead of going along with it. If it can't be checked from here, say that.
- Prefer the smallest change that solves the problem
- Never introduce `any` — TypeScript strict mode is enforced
- Do not import across workspaces using relative paths outside the workspace root
- Do not modify lockfiles unless required
- Do not normalize or reshape CMS data without validating with the user first
- Reusable logic belongs in a `/utils` folder using kebab-case filenames
- Use interfaces over type aliases; enums over union literal types
- Extend interfaces with `Pick` / `Omit` when improving flexibility
- Respect semantic HTML and WCAG AA accessibility by default
