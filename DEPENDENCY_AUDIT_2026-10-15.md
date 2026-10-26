# Dependency Audit — fredcorr/portoflio-2025

**Date:** 2026-10-15
**Branch:** `claude/stoic-johnson-zctbbh` (base: `cb7c700`, merge of #52)
**Scope:** npm workspace monorepo — root, `apps/web`, `apps/studio`, `shared/types`, `shared/utils`
**Totals:** 1,461 packages audited · **38 vulnerabilities (2 critical · 19 high · 17 moderate)** · 44 outdated direct dependencies

> Reporting run only — no package changes were made. Remediation steps are listed per section; apply and validate (`turbo run lint typecheck build` + `npm run test`) before committing.

---

## ✅ Remediation applied (2026-10-26)

The safe, non-breaking security remediation from this report has been implemented on `claude/stoic-johnson-zctbbh`:

- **`apps/web`:** `next` → `^16.4.1` (resolves to **16.4.3**), `@next/third-parties` → `^16.4.3`, `eslint-config-next` → `^16.4.1`. 16.4.3 also covers three *new* advisories published after 2026-10-15 affecting `<=16.4.0` (SVG-based Image Optimization RCE, Server Actions DoS, `use cache` typed-array RCE).
- **Root `overrides`:** `qs` → 6.16.1, `markdown-it` → 14.3.3, `js-yaml@4.1.0` → 4.3.2, `hono` → ^4.13.13, `adm-zip` → ^0.6.1, `sharp` → ^0.35.5, `smol-toml` → ^1.9.1.
- **Lockfile** re-resolved: pulled in-range minors forward (Sanity stack 6.6→6.19, React 19.2→19.3, etc.), clearing the undici/braces/adm-zip cluster.

**Result: 38 → 20 vulnerabilities. All 2 critical and all production-facing high/moderate advisories cleared** (Next.js RCEs, `proxy-addr`, `dompurify`, `sharp`, `qs`, `js-yaml`, `nanoid`, `fast-uri`, `brace-expansion`, `source-map-js`, `markdown-it`, `smol-toml`, `hono`).

**Validation:** `turbo run` — `web#lint`, `web#typecheck`, `studio#typecheck`, `studio#build` all pass; `web#build` compiles and type-checks cleanly but fails only at `generateStaticParams()` fetching the Sanity content API, which is unreachable from the build sandbox (environmental, not a regression — fails identically on the base commit).

**Deliberately NOT changed** (require individual review — not part of a safe security pass):
- The **20 remaining vulnerabilities** are all in dev/build-only tooling — the `figma-developer-mcp` → jimp/zod chain and the `sanity` CLI → `@module-federation/*`/undici chain, plus `sanity-plugin-media`. Their only automatic "fix" is a breaking **major downgrade** of `sanity`, `figma-developer-mcp`, or `sanity-plugin-media`, so they were left in place. None ship in the deployed web runtime.
- All **MAJOR** version bumps listed below (`framer-motion`, `recharts`, `@portabletext/react`, `@sanity/client` v8, `@sanity/ui` v4, `eslint` v10, `typescript` v7, etc.).

---

## 🔴 CRITICAL — act first

### `next` (direct, `apps/web`) — multiple RCE + cache-poisoning advisories
- **Current:** 16.3.0 · **Wanted/Latest:** 16.4.1 · **Update type:** minor (within declared `^16.3.0`)
- **Security patched at:** 16.3.8 (16.4.1 includes it)
- **Advisories (installed 16.3.0 is affected by all nine):**
  - GHSA-p293-qw3h-jr36 — **Unauthenticated RCE on Windows-hosted servers (CVSS 9.0)**
  - GHSA-2xp9-vwfh-vxw4 — Unauthenticated RCE in Image Optimization API via AVIF files
  - GHSA-vcvr-r3jv-pc5j — RCE in `next/og` ImageResponse
  - GHSA-cjq9-62q9-8jv4 — SSRF in Image Optimization (CVSS 6.5)
  - GHSA-39w2-rjm5-chcv — Info disclosure in dev-server MCP endpoint (CVSS 5.4)
  - GHSA-f87g-xv8r-7p7x — Info disclosure in App Router metadata image routes (CVSS 5.3)
  - GHSA-4jqv-mc3x-m676 / GHSA-mcj8-r9mp-w47p — SSG/ISR cache poisoning (self-hosted)
  - GHSA-3w37-wq28-93x7 — Draft Mode content leak via pending `use cache`
- **Practical reach:** site deploys on Vercel (Linux), so the Windows-only RCE is low practical risk, but the AVIF/`next/og` RCE, Image-Optimization SSRF, ISR cache-poisoning and Draft-Mode leak apply regardless of host.
- **Fix:** bump `next` to `^16.4.1` in `apps/web/package.json` (also bump `@next/third-parties` → 16.4.1 and `eslint-config-next` → 16.4.1 to keep the Next line aligned). In-range, low-risk minor.

### `proxy-addr` (transitive) — IP spoofing (CVSS 9.1)
- GHSA-jqcg-44mw-7w3h — IP spoofing via IPv4-mapped IPv6 trust subnet; affected `<2.0.8`, fix in-range.
- Pulled in transitively (Sanity/dev tooling chain). Resolves once its parent is updated or via an override to `proxy-addr@^2.0.8`.

---

## 🟠 HIGH — blocked by the root `overrides` block

The root `package.json` `overrides` pin several packages at **versions that are themselves vulnerable**, so plain `npm audit fix` cannot resolve them. These overrides should be bumped:

| Override (current pin) | Vulnerable? | Safe target | Advisories |
|---|---|---|---|
| `qs: 6.15.3` | yes (`6.14.2–6.15.3`) | `6.16.1` | GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g |
| `markdown-it: 14.2.0` | yes (`<14.3.1`) | `14.3.1`+ (latest 15.0.2 is major) | GHSA-253c-mchw-3w2r (ReDoS) |
| `js-yaml@4.1.0: 4.1.1` | yes (`<4.3.2`) | `4.3.2`+ | GHSA-5p4m-2wfm-xmqj, GHSA-2883-xcg3-v3hh |
| `sharp: ^0.35.3` | yes (`<0.35.5`) | `0.35.5` | GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w (libheif/librsvg CVEs) |
| `smol-toml: ^1.7.1` | yes (`<=1.8.0`) | `1.9.1` | GHSA-r4xh-jqrq-34v2 (quadratic parse) |
| `adm-zip: ^0.6.0` | yes (`<=0.6.0`) | `0.6.1` (7 advisories, incl. path traversal, SUID preservation, zip-bomb) | GHSA-vwc7-r8mq-g2x9 + 6 more |
| `hono: ^4.11.9` | partially (`<4.13.7`) | `^4.13.13` | 8 advisories incl. SSR cross-user leak, ReDoS, XSS |

### Other HIGH, fixable in-range (not override-pinned)
- `brace-expansion` (4 DoS advisories, `<5.0.12`) — fix in-range
- `fast-uri` (7 advisories: host confusion / SSRF, `<3.1.8`) — fix in-range
- `nanoid` (GHSA-2v37-7h3g-55p8, `<3.3.18`) — fix in-range
- `source-map-js` (GHSA-68fv-2mgg-jv7q DoS, `<1.2.2`) — fix in-range

### HIGH in dev/build tooling (lower runtime exposure)
- `@modelcontextprotocol/sdk` (GHSA-6qxp-vccf-f47h, OAuth credential leak) → via `figma-developer-mcp` (dev MCP tool). npm suggests downgrading `figma-developer-mcp` to 0.9.0 (major) — review instead of auto-applying.
- `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` (dev-only lint tooling).
- `braces`, `undici` → pulled via the `sanity` toolchain (see below).
- `js-yaml`/`source-map-js` also appear in build tooling chains.

---

## 🟡 MODERATE
`colord`, `dompurify` (XSS via IN_PLACE), `ip-address` (SSRF/trust-boundary), `markdown-it`, `qs`, `hono`, `smol-toml`, `undici` (19 advisories — the single largest cluster, all via the Sanity/vite dev chain). Most are fixable in-range once the overrides and the Sanity toolchain are bumped.

### The `sanity` toolchain cluster
`adm-zip`, `braces`, `smol-toml`, and `undici` are reached through `sanity` / `@sanity/workbench-cli` / `@module-federation/*`. npm's only automatic fix is `npm audit fix --force` → **`sanity@6.1.0`, a breaking *downgrade*** — do **not** run that. The installed `sanity` is 6.6.0 with 6.19.0 available (minor); updating the Sanity stack forward (see below) is the correct direction and should clear most of this cluster.

---

## 📦 Outdated dependencies (44) — by update type

### MAJOR (review changelogs before bumping — breaking by semver)
| Package | Current → Latest | Workspace | Notes |
|---|---|---|---|
| `@portabletext/react` | 6.2.0 → 8.0.1 | web | 2 majors; render-prop/serializer API changes |
| `@sanity/client` | 7.25.0 → 8.9.0 | web (+ root dep) | v8 major; also `@sanity/client ^7.23.1` in root |
| `@sanity/ui` | 3.5.0 → 4.4.6 | studio | v4 — **check peer alignment w/ `sanity` per studio CLAUDE.md** |
| `@sanity/visual-editing` | 5.7.3 → 6.1.3 | web | v6 major |
| `framer-motion` | 12.42.2 → 14.2.0 | web | 2 majors; renamed to `motion`, import/API changes |
| `recharts` | 2.15.4 → 3.10.1 | studio | v3 migration (2.x EOL per install warning) |
| `jose` | 5.10.0 → 6.2.12 | studio | v6 major (used for JWT in studio) |
| `eslint` | 9.39.5 → 10.12.0 | web | v10 major; flat-config/Node baseline changes |
| `typescript` | 6.0.3 → 7.0.2 | web + studio | v7 major — hold until toolchain supports it |
| `@types/node` | 22.20.1 → 26.6.5 | web + studio | keep aligned to runtime Node major |

### MINOR (safe within ranges; several are the security-relevant ones)
`next` 16.3.0→16.4.1 **(security)**, `eslint-config-next` 16.3.0→16.4.1 **(security)**, `@next/third-parties` 16.3.0→16.4.1, `react`/`react-dom` 19.2.8→19.3.1, `@types/react`/`@types/react-dom` 19.2→19.3, `sanity`/`@sanity/types`/`@sanity/vision`/`groq` 6.6.0→6.19.0 **(clears Sanity cluster)**, `lucide-react` 1.27→1.57, `react-hook-form` 7.83→7.90, `@hookform/resolvers` 5.5→5.9, `swiper` 14.0→14.3, `swr` 2.4→2.5, `tailwind-merge` 3.6→3.7, `three` 0.185→0.186, `styled-components` 6.4→6.6, `highlight.js` 11.11→11.12, `sanity-plugin-media` 6.0.7→6.3.5.

### PATCH (trivial)
`prettier` 3.9.6→3.9.10, `postcss` 8.5.23→8.5.30, `eslint-plugin-prettier` 5.5.6→5.5.7, `@sanity/dashboard` 6.0.14→6.0.22, `sanity-plugin-asset-source-unsplash` 7.0.21→7.0.29, `sanity-plugin-dashboard-widget-document-list` 3.0.15→3.0.23.

---

## ✅ Recommended remediation order

1. **Now (critical, low-risk):** bump `next` + `eslint-config-next` + `@next/third-parties` to 16.4.1 in `apps/web`. Clears 9 advisories incl. the critical RCEs.
2. **Security overrides:** update the root `overrides` pins — `qs@6.16.1`, `js-yaml@4.3.2+`, `sharp@0.35.5`, `smol-toml@1.9.1`, `hono@^4.13.13`, `adm-zip@0.6.1`, `markdown-it@14.3.1+`. Then `npm audit fix` can resolve the remaining in-range HIGH/MODERATE (`brace-expansion`, `fast-uri`, `nanoid`, `source-map-js`, `colord`, `dompurify`, `ip-address`).
3. **Sanity stack (minor):** move `sanity` + `@sanity/*` + `groq` to 6.19.0 — clears most of the undici/braces/adm-zip cluster. Verify `@sanity/ui` peer alignment if bumping it to v4.
4. **Patches + safe minors:** apply in one pass; run `turbo run lint typecheck build` and `npm run test` (note: `apps/web` suite has known pre-existing failures per CLAUDE.md — don't add new ones).
5. **Majors:** schedule individually with changelog review (`framer-motion`→motion, `recharts` v3, `@portabletext/react` v8, `@sanity/client` v8, `eslint` v10, `typescript` v7). Do **not** run `npm audit fix --force` — it would downgrade `sanity` to 6.1.0.
