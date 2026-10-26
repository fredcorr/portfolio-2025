# @fredcorr/sanity-plugin-lucide-icon-picker (vendored)

Sanity Studio input for picking [Lucide](https://lucide.dev) icons, registered
as the `lucide-icon` schema type.

Originally by [ContentWrap](https://github.com/contentwrap) (MIT — see
`LICENSE`), forked as `fredcorr/sanity-plugin-lucide-icon-picker` and vendored
here from commit `7aea367` (2.0.0, `@sanity/ui` v4 support).

It lives in the monorepo rather than being installed from git because npm 12
refuses git dependencies by default (`EALLOWGIT`), and the fork is not
published to the registry. It is a source-only package: `apps/studio` imports
the TypeScript directly, so there is no build step.

`@sanity/ui` is a regular dependency on purpose. The repo root hoists the
`@sanity/ui` v3 that `apps/web` uses, and a peer would resolve to that copy —
the v4 subpath imports here (`@sanity/ui/autocomplete`, `/menu`, `/popover`)
need v4.

`lucide-react` stays on the fork's `^0.532` so stored icon names keep
resolving; bumping it is a separate change.
