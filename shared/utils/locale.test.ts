import test from "node:test";
import assert from "node:assert/strict";
import { Locale } from "@portfolio/types/base";
import { fromCmsSlug, isLocale, localePrefix, toCmsSlug } from "./locale";

test("isLocale - accepts only supported locale codes", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("it"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale("IT"), false);
  assert.equal(isLocale(undefined), false);
});

test("localePrefix - default locale is unprefixed", () => {
  assert.equal(localePrefix(Locale.English), "");
  assert.equal(localePrefix(Locale.Italian), "it");
});

test("toCmsSlug - joins locale and segments into the stored slug", () => {
  assert.equal(toCmsSlug(Locale.English, []), "/");
  assert.equal(toCmsSlug(Locale.English), "/");
  assert.equal(toCmsSlug(Locale.English, ["journals", "foo"]), "journals/foo");
  assert.equal(toCmsSlug(Locale.Italian, []), "it");
  assert.equal(
    toCmsSlug(Locale.Italian, ["journals", "foo"]),
    "it/journals/foo",
  );
});

test("fromCmsSlug - splits a stored slug into locale and segments", () => {
  assert.deepEqual(fromCmsSlug("/"), { locale: Locale.English, segments: [] });
  assert.deepEqual(fromCmsSlug("journals/foo"), {
    locale: Locale.English,
    segments: ["journals", "foo"],
  });
  assert.deepEqual(fromCmsSlug("it"), { locale: Locale.Italian, segments: [] });
  assert.deepEqual(fromCmsSlug("it/journals/foo"), {
    locale: Locale.Italian,
    segments: ["journals", "foo"],
  });
  // An explicit default-locale prefix is not a locale marker — it stays a
  // path segment, which is what makes `/en/...` a non-canonical URL.
  assert.deepEqual(fromCmsSlug("en/journals"), {
    locale: Locale.English,
    segments: ["en", "journals"],
  });
  // A segment that merely starts with a locale code is not a prefix.
  assert.deepEqual(fromCmsSlug("italy-trip"), {
    locale: Locale.English,
    segments: ["italy-trip"],
  });
});

test("toCmsSlug and fromCmsSlug round-trip", () => {
  for (const slug of [
    "/",
    "about",
    "journals/foo",
    "it",
    "it/about",
    "it/journals/foo",
  ]) {
    const { locale, segments } = fromCmsSlug(slug);
    assert.equal(toCmsSlug(locale, segments), slug);
  }
});
