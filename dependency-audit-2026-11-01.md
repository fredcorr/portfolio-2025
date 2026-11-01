# Dependency Audit — portoflio-2025

**Date:** 2026-11-01
**Scope:** monorepo (`root`, `apps/web`, `apps/studio`, `shared/types`, `shared/utils`, `functions/`)
**Method:** `npm audit --package-lock-only` against the committed lockfile + registry latest-version lookup for all direct dependencies. (`node_modules` was not installed; audit ran against `package-lock.json`.)

> **Reporting only.** No dependency versions were changed, committed, or pushed. The actions below are recommendations.

---

## TL;DR — security first

`npm audit` reports **66 vulnerabilities: 3 critical, 22 high, 41 moderate.** Almost all are **transitive** (pulled in by tooling: Sanity CLI, `figma-developer-mcp`, ESLint, the Figma MCP's bundled Express). The one that matters most is first-party and user-facing:

| # | Package | Where | Severity | Risk | Fix |
|---|---------|-------|----------|------|-----|
| 1 | **next** 16.3.0 → **16.4.3** | `apps/web` (**production**) | 🔴 Critical | Unauth RCE (Windows host, Image Optimization AVIF/SVG, `next/og`, `use cache`), SSRF in Image Optimization, SSG/ISR cache poisoning, Draft-Mode leakage | **In-range minor bump** — just `npm update next eslint-config-next @next/third-parties`. No major migration. **Do this now.** |
| 2 | **dompurify** 3.4.12 | Studio/CLI (via `sanity` → `isomorphic-dompurify`) | 🔴 Critical | Multiple XSS bypasses (IN_PLACE, SAFE_FOR_TEMPLATES) | Bump `sanity` 6.6 → 6.21 (in-range minor) pulls the patched transitive |
| 3 | **proxy-addr** 2.0.7 | **dev/tooling only** (`express` ← MCP / `figma-developer-mcp`) | 🔴 Critical | IPv4-mapped-IPv6 trust-subnet spoofing | Not shipped to prod; low real risk. Clears when the Figma MCP dep tree updates |

**Action priority:** (1) bump Next.js today — it's trivial and closes real RCE/SSRF paths in the deployed site. (2) bump `sanity` to latest 6.x to clear the DOMPurify XSS in Studio. (3) the rest are dev-time tooling; schedule a cleanup but they don't ship to users.

---

## Security advisories by severity

Classification: **PROD** = reaches the deployed web app; **STUDIO** = Sanity Studio / CMS admin runtime; **FN** = serverless functions; **DEV** = build/lint/MCP tooling only, not shipped.

### 🔴 Critical (3)
- **next** `16.3.0` — **PROD**. GHSA-p293-qw3h-jr36 (RCE, CVSS 9.0), GHSA-cjq9-62q9-8jv4 (SSRF 6.5), GHSA-2xp9-vwfh-vxw4 / GHSA-2464-fhr4-w9xw / GHSA-vcvr-r3jv-pc5j (image/og RCE), several cache-poisoning/draft-leak (GHSA-4jqv-mc3x-m676, GHSA-3w37-wq28-93x7, GHSA-mcj8-r9mp-w47p). **Fix available, in-range.**
- **dompurify** `3.4.12` — **STUDIO** (via `sanity`/`@sanity/cli`). GHSA-55q2-fjhq-7xh7, GHSA-6688-9rhm-gjv2, GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr, GHSA-c6gr-qvv4-5v3f (XSS). Fix via `sanity` minor bump.
- **proxy-addr** `2.0.7` — **DEV** (via `express` ← `@modelcontextprotocol/sdk` / `figma-developer-mcp`). GHSA-jqcg-44mw-7w3h (IP spoofing 9.1). Fix available.

### 🟠 High (22 advisories; grouped by package)
- **sharp** `≤0.35.5-rc.1` — **PROD** (via `next` image optimization). GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w (libheif/librsvg memory-safety). Clears with Next/sharp bump.
- **@modelcontextprotocol/sdk** `≤1.31.0` — **DEV** (figma-developer-mcp). 6 advisories incl. GHSA-22jm-h49p-29qw (8.6), OAuth/credential-leak, DoS. `fixAvailable=false` (upstream figma-mcp hasn't bumped).
- **undici** — **DEV/CLI** (via `@module-federation/dts-plugin` ← sanity). ~30 advisories (TLS bypass, cache/cookie disclosure, DoS). Audit's suggested fix is a `sanity` **major** — don't force it.
- **adm-zip** `≤0.6.0` — **DEV/CLI** (via `@module-federation/dts-plugin`). 7 advisories (symlink overwrite, zip-bomb, SUID). Note: root `overrides` pins `adm-zip ^0.6.0`, which is still in-range vulnerable.
- **body-parser** `2.0.0–2.3.0` — **DEV** (express ← MCP). GHSA-27r3-jxmh-p828 (DoS).
- **brace-expansion** `4.0.0–5.0.11` — **DEV** (minimatch). 4 DoS advisories. (Root `overrides` sets `@isaacs/brace-expansion 5.0.1` / `minimatch ^10.2.6`, still below the fixed 11.0.1.)
- **fast-uri** `3.0.0–3.1.8` — **DEV** (ajv ← MCP). 11 advisories (SSRF, host confusion).
- **js-yaml** `4.0.0–4.3.1` — **DEV** (eslintrc / @vercel/frameworks / figma-mcp). 2 DoS (CVSS 7.5). Root `overrides` pins `js-yaml@4.1.0→4.1.1`, still vulnerable range.
- **markdown-it** `≤14.3.2` — **DEV/build** (`@portabletext/markdown`, `@mdit/plugin-alert`). 4 quadratic-DoS. Root `overrides` pins `14.2.0`, still vulnerable.
- **nanoid** `<3.3.18` — **DEV/build** (postcss). GHSA-2v37-7h3g-55p8.
- **source-map-js** `1.0.0–1.2.1` — **DEV/build** (postcss/tailwind). GHSA-68fv-2mgg-jv7q (DoS 7.5).
- **vite** `8.0.0–8.1.5` — **DEV** (sanity dev server / launch-editor). 5 advisories.
- **zod** `<4.6.6` — **DEV** (figma-mcp, sanity-plugin-media). GHSA-mrhx-c7xc-m3w5 (memory DoS). `fixAvailable=false`.
- **@jimp/\*** — **DEV** (figma-developer-mcp).

### 🟡 Moderate (41 advisories; grouped)
- **hono** `≤4.13.10` & **@hono/node-server** `1.19.10–2.1.2` — **FN** (functions/, root pins `hono ^4.11.9`). 9 advisories (ReDoS CORS, SSR cross-user leak, path traversal in `toSSG`, static-path middleware bypass). Fix available (bump hono override to ≥4.13.11).
- **qs** `2.2.5–6.16.0` — **DEV** (express ← MCP). 3 advisories. Root `overrides` pins `qs 6.15.3`, still in vulnerable range.
- **minimatch** `<11.0.1` — **DEV** (eslint tree). GHSA-g3hv-75wg-m249. Audit's fix is an ESLint **major**.
- **ip-address** `≤10.7.3` — **DEV**. 5 advisories (SSRF classifier gaps).
- **smol-toml** `≤1.8.0` — **DEV** (`@vercel/frameworks`). GHSA-r4xh-jqrq-34v2.
- **colord** `<2.9.4` — **DEV**. GHSA-2wm5-q62r-hmrv.
- **@eslint/config-array, @eslint/eslintrc, @eslint-community/eslint-utils** — **DEV** (resolve via ESLint major).

> **Note on `overrides`:** `root/package.json` already pins ~15 packages to try to stay patched (`qs`, `markdown-it`, `js-yaml`, `adm-zip`, `minimatch`, `hono`, `sharp`, `postcss`, …). Several of those pins are now **below the newest fixed version** because fresh CVEs landed after the pins were set. The overrides map needs a refresh pass — bump the pinned versions to the current patched releases rather than removing them.

---

## Outdated direct dependencies (55) — current → latest

Current = version resolved in `package-lock.json`. Spec = range in `package.json`.

### `apps/web`
| Type | Package | Current | Latest | Breaking-change notes |
|------|---------|---------|--------|-----------------------|
| minor | **next** | 16.3.0 | 16.4.3 | Security fix; in-range, no migration |
| minor | eslint-config-next | 16.3.0 | 16.4.3 | Pair with next |
| minor | @next/third-parties | 16.3.0 | 16.4.3 | Pair with next |
| MAJOR | @sanity/client | 7.25.0 | 8.14.1 | v8 major — review client API/`perspective` changes before bumping |
| MAJOR | @sanity/visual-editing | 5.7.3 | 6.2.0 | v6 major — pairs with visual-editing/client; test draft mode |
| MAJOR | @hookform/resolvers | 5.5.7 | 7.0.0 | Two majors — resolver signature changes; check Yup integration |
| MAJOR | @portabletext/react | 6.2.0 | 8.0.1 | Two majors — component prop/typing changes |
| MAJOR | framer-motion | 12.42.2 | 14.9.0 | Two majors — API renames (now `motion`); audit imports |
| MAJOR | eslint | 9.39.5 | 10.14.0 | v10 — flat-config/rule changes; must align `eslint-config-next` |
| MAJOR | typescript | 6.0.3 | 7.0.2 | v7 — compiler behavior changes; run full typecheck |
| MAJOR | @types/node | 22.20.1 | 26.6.6 | Match to runtime Node; large jump |
| minor | react / react-dom | 19.2.8 | 19.3.1 | Minor |
| minor | @types/react / -dom | 19.2.17 / 19.2.3 | 19.3.0 | Minor |
| minor | lucide-react | 1.27.0 | 1.66.0 | New icons; low risk |
| minor | react-hook-form | 7.83.0 | 7.91.0 | Minor |
| minor | swiper | 14.0.6 | 14.4.0 | Minor |
| minor | swr | 2.4.2 | 2.5.1 | Minor |
| minor | three | 0.185.1 | 0.187.0 | Pre-1.0, treat minor as possibly-breaking; pair with @types/three |
| minor | groq / tailwind-merge / highlight.js / vanilla-cookieconsent / dotenv-cli | — | — | Minor, low risk |
| patch | botid / eslint-plugin-prettier / postcss / prettier | — | — | Patch, safe |

### `apps/studio`
| Type | Package | Current | Latest | Notes |
|------|---------|---------|--------|-------|
| minor | **sanity** | 6.6.0 | 6.21.0 | **Clears the DOMPurify critical**; in-range |
| minor | @sanity/vision / @sanity/types | 6.6.0 | 6.21.0 | Pair with sanity |
| MAJOR | @sanity/ui | 3.5.0 | 4.4.10 | v4 major — per `apps/studio/CLAUDE.md`, align `@sanity/ui` major carefully with plugins; don't bump blindly |
| MAJOR | recharts | 2.15.4 | 3.10.1 | v3 — dashboard chart API changes |
| MAJOR | jose | 5.10.0 | 6.2.14 | v6 — check JWT/JWE usage in preview auth |
| MAJOR | typescript | 6.0.3 | 7.0.2 | v7 |
| MAJOR | @types/node | 22.20.1 | 26.6.6 | — |
| minor | react / react-dom | 19.2.8 | 19.3.1 | Minor |
| minor | styled-components | 6.4.4 | 6.6.0 | Minor |
| minor | sanity-plugin-media | 6.0.7 | 6.6.0 | Minor |
| patch | @sanity/dashboard / sanity-plugin-asset-source-unsplash / sanity-plugin-dashboard-widget-document-list / prettier | — | — | Patch |

### `root`
| Type | Package | Current | Latest | Notes |
|------|---------|---------|--------|-------|
| MAJOR | @sanity/client | 7.25.0 | 8.14.1 | v8 — also pinned via web; bump together |
| MAJOR | typescript | 6.0.3 | 7.0.2 | v7 — repo-wide; strict mode |
| minor | @sanity/blueprints | 0.24.0 | 0.32.0 | Pre-1.0; review blueprint API |
| minor | @sanity/functions | 1.4.0 | 1.11.0 | Serverless fn runtime |
| minor | turbo | 2.10.7 | 2.11.10 | Minor |
| minor | @types/three | 0.185.1 | 0.187.0 | Pair with three |
| patch | prettier / tsx | — | — | Patch |

### `shared/types`, `shared/utils`
No outdated direct runtime dependencies (they consume `@portfolio/types` via `*` workspace links and have no third-party deps of their own).

---

## Recommended sequencing

1. **Now (security, zero/low effort, in-range):**
   `npm update next eslint-config-next @next/third-parties sanity @sanity/vision @sanity/types` then `turbo run lint typecheck build` + `npm run test`. Closes the Next.js critical RCE/SSRF and the DOMPurify XSS without any major migration.
2. **Soon (refresh `overrides`):** bump the pinned versions in root `overrides` (`qs`, `markdown-it`, `js-yaml`, `adm-zip`, `minimatch`, `hono`, …) to current patched releases — several pins have fallen behind new CVEs.
3. **Planned (majors, test individually):** `@sanity/client` v8 (+visual-editing v6), `@sanity/ui` v4, `recharts` v3, `framer-motion` v14, `@hookform/resolvers` v7, `@portabletext/react` v8, `eslint` v10, `typescript` v7, `@types/node` v26. Each is a breaking major — do one at a time behind the `turbo run lint typecheck build` gate.
4. **Tooling noise:** most remaining highs/moderates are in `figma-developer-mcp` / Sanity CLI / ESLint transitive trees — not shipped to users. Track upstream, no urgent action.
