# Sanity Studio Agent Rules

This workspace is a Sanity Studio project (schemas, GROQ, previews).

## Schema rules

- Reuse existing document/object types before creating new ones
- Follow established naming conventions for:
  - schema names (`name`)
  - titles (`title`)
  - field names (consistent casing and semantics)
- Prefer `object` types for reusable field groups and reference them across schemas
- Add validation to critical fields (required, min/max, URL/email formats, etc.)
- Keep schema definitions small and composable:
  - extract repeated field sets into their own files
- Any schema change must consider impact on `web/` queries and types

## Shared types between Studio and Web

- When a schema shape changes, ensure shared frontend types are updated (or new shared types are created)
- Prefer deriving/reusing types from the Studio schema conventions rather than inventing parallel shapes

## GROQ querying rules

- Prefer small, composable GROQ fragments for repeated selections
- Always select only what the frontend needs (avoid over-fetching)
- For references:
  - resolve references explicitly with `->` when required by the UI
  - avoid deep expansions unless necessary
- Be explicit about language/locale fields if content is localized (don’t assume defaults)
- Keep queries stable: avoid relying on implicit ordering unless explicitly set

## Preview / Presentation rules

- If the project uses Presentation/Preview mode:
  - Keep preview URL logic centralized (e.g., a single config/module)
  - Avoid hardcoding hostnames; use env vars
  - Prefer token-based or draft-mode aware preview flows
- Preview must support drafts:
  - queries should be able to return draft content when in preview mode
  - avoid caching behavior that prevents draft visibility

## Plugin rules

- Do not add new Sanity plugins without checking peer dependency compatibility
  - especially `@sanity/ui` major version alignment
- Prefer official Sanity plugins or well-maintained community plugins
- If a plugin is incompatible, propose a local/custom implementation rather than forcing peer overrides

## Studio developer experience

- Keep Desk Structure / Structure Builder organized:
  - group related document types
  - avoid duplicating entries
- Keep schema exports deterministic and maintainable
- Dashboard widgets live in `apps/studio/dashboard` and the dashboard tool must remain the first plugin so Studio loads with operational context. Add new widgets there and keep them lightweight (fetch only what is required).

## Secrets

- The Studio is public static files: every `SANITY_STUDIO_*` variable its code reads is inlined into the bundle anyone can download.
- Never read an API key, private key, token, password or shared secret in Studio code, and never give one the `SANITY_STUDIO_` prefix. A widget that needs one must call a server-side endpoint (`apps/web/app/api/` route or Sanity Function) that holds the secret and checks the editor's Sanity session.
- `eslint.config.mjs` enforces this with `no-restricted-syntax`. Never disable it. Its `ALLOWED` list holds names the repo owner has knowingly made public (currently `GSC_PRIVATE_KEY`, a Restricted read-only Search Console service account); add to it only when the owner explicitly asks.
