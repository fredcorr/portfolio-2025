# Dependency Audit — fredcorr/portoflio-2025

_Generated 2026-11-15 on branch `claude/stoic-johnson-f7n53i`. Single npm workspaces monorepo (one `package-lock.json`); grouped below by workspace/exposure and severity._

## TL;DR

- **63 vulnerabilities** reported by `npm audit`: **3 critical, 22 high, 38 moderate**.
- **The only critical exposed to the public internet is Next.js** (web app, direct production dependency). It carries multiple **unauthenticated RCE** advisories plus cache-poisoning/SSRF/DoS. **Fix is a low-risk minor bump: `16.3.0 → 16.4.6`.** This is the single highest priority.
- The other two criticals are **not public-facing**: `dompurify` lives inside the authenticated Sanity Studio admin UI; `proxy-addr` lives inside the local-only Figma MCP dev tool.
- ~55 outdated packages overall; most are safe patch/minor bumps. A handful are majors (TypeScript 7, ESLint 10, framer-motion 14, @sanity/client 8, @sanity/ui 4, recharts 3, @portabletext/react 8) that need changelog review before upgrading.
- No changes were applied — this is a report only.

---

## PRIORITY 1 — Security (act on these first)

### 🔴 CRITICAL — Next.js (PRODUCTION, public-facing) — `apps/web`
- **Package:** `next` (direct dependency)
- **Current → Latest:** `16.3.0` → **`16.4.6`** — **minor** bump, auto-fixable
- **Why it matters:** this is the live web app served to visitors. Multiple advisories affect `16.3.0`:
  - Unauthenticated **RCE** via Image Optimization API — SVG (GHSA-2464-fhr4-w9xw) and AVIF (GHSA-2xp9-vwfh-vxw4) files
  - **RCE** in `next/og` ImageResponse (GHSA-vcvr-r3jv-pc5j) and in `use cache` returning typed arrays (GHSA-673q-mjm6-r5xr)
  - Cache poisoning of SSG/ISR pages → cross-user content substitution + persistent DoS (GHSA-mcj8-r9mp-w47p, GHSA-4jqv-mc3x-m676) — relevant since this app uses ISR (`revalidate: 3600`)
  - SSRF in Image Optimization (GHSA-cjq9-62q9-8jv4); Draft Mode content leak (GHSA-3w37-wq28-93x7); App Router Server Actions DoS (GHSA-p3m5-59mp-jv5r)
- **Breaking changes:** none expected — same major (16.x), minor version. `eslint-config-next` and `@next/third-parties` should be bumped in lockstep (both `16.3.0 → 16.4.6`).
- **Note:** Vercel's platform mitigates some of these at the edge, but the pinned dependency should still be upgraded.

### 🔴 CRITICAL — DOMPurify (Sanity Studio admin UI only) — `apps/studio`
- **Package:** `dompurify@3.4.12` (transitive: `sanity` → `isomorphic-dompurify`)
- **Advisories:** 5× XSS bypasses, all `<= 3.4.16` (GHSA-55q2-fjhq-7xh7, GHSA-6688-9rhm-gjv2, GHSA-mrv2-3pqr-j5jr, GHSA-cg2g-xh64-v4q7, GHSA-c6gr-qvv4-5v3f)
- **Exposure:** Studio is the **authenticated CMS editor**, not the public site — real-world risk is far lower than the Next.js finding.
- **Fix:** bump `sanity` `6.6.0 → 6.23.0` (minor, within 6.x) to pull a patched transitive DOMPurify. (`npm audit`'s suggestion of `sanity@5.14.1` is a mis-resolution — 6.23.0 is the real latest.)

### 🔴 CRITICAL — proxy-addr (local dev tool only) — root `devDependencies`
- **Package:** `proxy-addr@2.0.7` (transitive: `figma-developer-mcp` → `express@5`)
- **Advisory:** IP spoofing via IPv4-mapped IPv6 (GHSA-jqcg-44mw-7w3h), fixed in `2.0.8`
- **Exposure:** the Figma MCP server runs only on a developer's machine; not shipped or network-exposed in production. Lowest practical priority of the three criticals.

### 🟠 HIGH — notable
- **`sanity-plugin-media`** (studio, direct) `6.0.7 → 6.6.3` — auto-fixable; clears a `zod`-chain high.
- **Sanity CLI/build toolchain** (transitive via `sanity@6.6.0`): `adm-zip` (zip-slip / DoS / SUID), `markdown-it`, `@oclif/core`, `undici`, `vite`, `nanoid`, `brace-expansion`, `js-yaml`, `source-map-js` — **all build/CLI-time, not in any shipped bundle.** Bumping `sanity` to `6.23.0` resolves most. ⚠️ The existing root `overrides` are now stale: `markdown-it@14.2.0` and `adm-zip@^0.6.0` are still flagged (adm-zip needs `> 0.6.1`).
- **`figma-developer-mcp@0.13.2`** (dev tool, direct) + its chain `@modelcontextprotocol/sdk` (OAuth credential leak, token confusion, DoS) and `@jimp/*` (via `zod`) — **no upstream fix available**; dev-only. Monitor for a release or consider pinning/removing if unused in CI.

---

## PRIORITY 2 — Outdated packages (no advisory, grouped by update type)

### `apps/web`
| Package | Current → Latest | Type |
|---|---|---|
| next / eslint-config-next / @next/third-parties | 16.3.0 → 16.4.6 | minor (**also security**) |
| react / react-dom | 19.2.8 → 19.3.1 | minor |
| @hookform/resolvers | 5.5.7 → **7.0.6** | **major** |
| @portabletext/react | 6.2.0 → **8.0.1** | **major** |
| framer-motion | 12.42.2 → **14.14.0** | **major** |
| @sanity/client | 7.25.0 → **8.16.0** | **major** |
| @sanity/visual-editing | 5.7.3 → **6.2.1** | **major** |
| swiper | 14.0.6 → 14.4.0 | minor |
| three / @types/three | 0.185.1 → 0.187.0 | minor (0.x) |
| lucide-react | 1.27.0 → 1.73.0 | minor |
| swr, tailwind(-merge/postcss), botid, highlight.js, focus-trap-react, dotenv-cli, @vercel/speed-insights, vanilla-cookieconsent, react-hook-form | various | patch/minor |

### `apps/studio`
| Package | Current → Latest | Type |
|---|---|---|
| sanity + @sanity/types/vision/dashboard | 6.6.0 → 6.23.0 | minor (**also security**) |
| @sanity/ui | 3.5.0 → **4.4.12** | **major** (⚠️ Studio peer-dep alignment — see studio CLAUDE.md plugin rules) |
| recharts | 2.15.4 → **3.10.1** | **major** (v2 branch EOL) |
| jose | 5.10.0 → **6.2.17** | **major** |
| styled-components | 6.4.4 → 6.6.0 | minor |
| sanity-plugin-media / -asset-source-unsplash / -dashboard-widget-document-list | — | minor |

### Root / shared tooling
| Package | Current → Latest | Type |
|---|---|---|
| typescript | 6.0.3 → **7.0.2** | **major** (strict mode enforced repo-wide — verify `turbo run typecheck` before adopting) |
| eslint | 9.39.5 → **10.15.0** | **major** |
| @types/node | 22.20.1 → **26.6.6** | **major** |
| turbo | 2.10.7 → 2.11.11 | minor |
| prettier | 3.9.6 → 3.10.1 | minor |
| tsx | 4.23.1 → 4.23.15 | patch |
| @sanity/blueprints | 0.24.0 → 0.34.1 | minor (0.x) |
| @sanity/functions | 1.4.0 → 1.11.0 | minor |

---

## Recommended sequence
1. **Now:** `next` + `eslint-config-next` + `@next/third-parties` → `16.4.6` (clears every Next.js critical/high; low-risk minor). Run `turbo run lint typecheck build` + `npm run test` after.
2. **Soon:** `sanity` family → `6.23.0` and `sanity-plugin-media` → `6.6.3` (clears the DOMPurify critical + most of the Studio toolchain highs).
3. **Housekeeping:** refresh the stale `overrides` (`adm-zip`, `markdown-it`); decide whether `figma-developer-mcp` is still needed (its chain has no fix).
4. **Deliberate, one at a time with changelog review:** the majors (TS 7, ESLint 10, @sanity/ui 4, @sanity/client 8, framer-motion 14, recharts 3, @portabletext/react 8, @hookform/resolvers 7, jose 6, @types/node 26).

_Verification basis: `npm ci` on a clean tree, then `npm outdated` and `npm audit` across all workspaces._
