import { revalidateTag } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import {
  buildRevalidationTags,
  type RevalidationPayload,
} from '@/utils/build-revalidation-tags'

/**
 * Sanity webhook receiver. Invalidates cached content on publish.
 *
 * Configure one webhook **per dataset** in Sanity's API settings, each pointing
 * at the deployment that serves that dataset, triggering on create, update and
 * delete. Set its `dataset` field explicitly — the field accepts `*`, meaning
 * every dataset in the project, which would send develop's publishes to
 * production.
 *
 * Projection:
 *
 *   {
 *     "_id": coalesce(_id, before()._id),
 *     "_type": coalesce(_type, before()._type),
 *     "slug": coalesce(slug.current, before().slug.current),
 *     "language": coalesce(language, before().language),
 *     "refs": coalesce(translations[].value._ref, before().translations[].value._ref)
 *   }
 *
 * The webhook's filter must include `translation.metadata` alongside the page
 * types and settings: linking a translation edits only that document.
 *
 * A bare `_id` is not enough. The payload is the document *after* the change,
 * and after a delete there is no document — so `before()` is the only way to
 * learn which document went away. Deletes are precisely when accurate tags
 * matter most: an unpublished article has to leave the listings and the
 * sitemap, and nothing else will tell them.
 *
 * `_id` drives precise invalidation; without it a publish falls back to
 * type-level tags, which is coarser than necessary.
 *
 * `language` scopes set invalidation to one locale, so an Italian publish or
 * delete leaves English listings cached. Without it — a projection not yet
 * updated, or a document from before translations — every locale's set tags
 * fire: correct, just coarser. See `utils/build-revalidation-tags.ts`.
 *
 * `refs` exists only on `translation.metadata` deliveries: the ids of every
 * version in the group, so the first link (which no cached page can know the
 * metadata id of yet) and an unlink (via `before()`) still reach the pages.
 */

/**
 * Sent on every delivery, so they are readable even when the projection
 * resolves to nothing — which is the normal case for a delete.
 */
const DATASET_HEADER = 'sanity-dataset'
const OPERATION_HEADER = 'sanity-operation'

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  if (!secret) {
    return Response.json(
      { error: 'Revalidation secret not configured.' },
      { status: 500 }
    )
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature) {
    return Response.json({ error: 'Missing signature.' }, { status: 401 })
  }

  // The raw body string is what the signature is computed over, so read it as
  // text and parse afterwards rather than using request.json().
  const body = await request.text()

  if (!(await isValidSignature(body, signature, secret))) {
    return Response.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  // Each deployment reads exactly one dataset, so an event from any other one
  // describes content this cache does not hold. Distinct secrets per
  // environment should already prevent it, but a webhook whose `dataset` is
  // left as `*` fires for every dataset in the project — and because `prod` is
  // cloned from `develop`, document ids match across them, so those events
  // would land on real id tags and evict live entries.
  //
  // Nothing would be served wrong: each deployment refetches from its own
  // dataset. The cost is cache thrash, and it is silent, which is why this
  // answers loudly rather than ignoring the event. Sanity treats 4xx as
  // undeliverable and stops retrying, and the response body surfaces in the
  // webhook attempts log.
  const eventDataset = request.headers.get(DATASET_HEADER)
  const operation = request.headers.get(OPERATION_HEADER)

  if (eventDataset !== process.env.SANITY_DATASET) {
    return Response.json(
      {
        error: `Dataset mismatch: event for "${eventDataset}", this deployment serves "${process.env.SANITY_DATASET}".`,
      },
      { status: 400 }
    )
  }

  let payload: RevalidationPayload

  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const tags = buildRevalidationTags(payload, operation)

  // A payload carrying neither an id nor a type tells us nothing about what to
  // invalidate.
  //
  // This used to fall back to a coarse `sanity:content` tag, described as
  // deliberately over-invalidating. It did not: no cached entry declares that
  // tag, so `revalidateTag('sanity:content')` matched nothing and the event was
  // dropped while the response claimed success. A safety net that catches
  // nothing is worse than none, because it stops you looking.
  //
  // There is no honest recovery here — the only signal about what changed is
  // the part that went missing. So fail loudly instead: log for the platform's
  // runtime logs, and answer 4xx so the same message lands in Sanity's webhook
  // attempts log, where whoever configured the projection will see it. The
  // `cacheLife` timer remains the backstop.
  if (tags.size === 0) {
    const detail = `operation=${operation ?? 'unknown'} dataset=${eventDataset}`

    console.error(
      `[revalidate] Unusable webhook payload (${detail}). Nothing was invalidated. ` +
        'The projection is almost certainly missing before(), which a delete needs: ' +
        '{"_id": coalesce(_id, before()._id), "_type": coalesce(_type, before()._type), ' +
        '"slug": coalesce(slug.current, before().slug.current)}'
    )

    return Response.json(
      {
        revalidated: false,
        error:
          'Payload carried neither _id nor _type — nothing could be invalidated. Add before() to the webhook projection.',
      },
      { status: 422 }
    )
  }

  // 'max' gives stale-while-revalidate: the next visitor is served the cached
  // copy immediately while fresh data loads in the background. The deprecated
  // single-argument form expires the entry outright, making that visitor wait
  // on a live Sanity round-trip — do not use it here.
  for (const tag of tags) {
    revalidateTag(tag, 'max')
  }

  return Response.json({ revalidated: true, tags: [...tags] })
}
