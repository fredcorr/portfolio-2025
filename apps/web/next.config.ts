import type { NextConfig } from 'next'
import { withBotId } from 'botid/next/config'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

const nextConfig: NextConfig = {
  // Set the workspace root for the monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),

  cacheComponents: true,

  // Custom cache profiles that reproduce the route-segment `revalidate` values
  // this app used before Cache Components.
  //
  // `expire` is the load-bearing field. The stock presets ('hours', 'weeks')
  // cap it at 1 day / 30 days, and past `expire` the next visitor waits on a
  // synchronous Sanity round-trip instead of being served stale. On a
  // low-traffic portfolio that would hit a large share of page views, so both
  // profiles pin it to a year — matching the pre-migration behaviour.
  cacheLife: {
    // Was `export const revalidate = 3600` in app/[[...slug]]/page.tsx
    cmsPage: { stale: 300, revalidate: 3600, expire: 31536000 },
    // Was `export const revalidate = 604800` in sitemap.ts and llms.txt/route.ts
    cmsIndex: { stale: 300, revalidate: 604800, expire: 31536000 },
  },

  // ==========================================================================
  // TEMPORARY WORKAROUND — added 2026-08-07, delete when Vercel fixes this.
  //
  // WHAT   Opts out of Next 16.3's immutable static assets
  //        (/_next/static/immutable/*), reverting to pre-16.3 asset naming.
  //
  // WHY    Vercel's Preview Comments injects its toolbar script by patching
  //        deployed static files. It cannot patch a file declared immutable,
  //        so every preview deploy dies with
  //        IMMUTABLE_STATIC_PATCH_PREVIEW_COMMENTS. Note the *build* succeeds
  //        and only the deploy step fails, which makes this easy to
  //        misdiagnose as a build problem. Vercel's own hint ("upgrade to
  //        next@v16.3.0-canary.32 or newer") is wrong — 16.3.0 stable already
  //        exceeds that prerelease.
  //
  // COST   We give up the CDN win: fewer requests and bytes, better TTFB for
  //        repeat visitors across deploys. Nothing breaks — this is exactly
  //        how the site behaved on 16.2.
  //
  // REMOVE Delete this line, push, and see whether the preview deploys. If it
  //        fails with the same error, Vercel hasn't fixed it yet — put it
  //        back. Two-minute test, no production risk.
  //
  // ALT    Turning off the Vercel Toolbar for this project also fixes it and
  //        keeps the CDN win, but costs the whole toolbar (a11y and perf
  //        audits included), not just comments. Rejected for that reason.
  // ==========================================================================
  supportsImmutableAssets: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Sanity asset URLs are content-hashed, so a transform can never go stale.
    // Caching for a year avoids paying to re-optimize the same image.
    minimumCacheTTL: 31536000,
    // Next requires every quality used by next/image to be declared here.
    qualities: [75],
    formats: ['image/avif', 'image/webp'],
  },
}

// Messages and formatting only; the request config reads the `[locale]` root
// param. Routing stays with proxy.ts.
const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts',
  experimental: {
    // Generates messages/en.d.json.ts with the literal message text, so a
    // missing or misnamed ICU argument (`{name}`) fails typecheck too, not
    // just an unknown key.
    createMessagesDeclaration: './messages/en.json',
  },
})

export default withBotId(withNextIntl(nextConfig))
