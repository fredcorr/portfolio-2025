import assert from 'node:assert/strict'
import test from 'node:test'

import en from './en.json'
import it from './it.json'

type Tree = { [key: string]: string | Tree }

/** Every leaf as a dotted path → value, so the two files compare key by key. */
const flatten = (tree: Tree, prefix = ''): Map<string, string> => {
  const leaves = new Map<string, string>()

  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      leaves.set(path, value)
    } else {
      for (const [leaf, text] of flatten(value, path)) {
        leaves.set(leaf, text)
      }
    }
  }

  return leaves
}

/**
 * ICU argument names (`{name}`, `{count, plural, …}`) used by a message. A
 * `{…}` straight after a plural/select key (`one {entry}`, `=0 {none}`) is a
 * branch body, not an argument, so it is skipped.
 */
const argumentsOf = (message: string) =>
  [
    ...new Set(
      [
        ...message.matchAll(
          /(?<!\b(?:zero|one|two|few|many|other|=\d+)\s*)\{\s*(\w+)\s*[,}]/g
        ),
      ].map(match => match[1])
    ),
  ].sort()

const english = flatten(en)
const italian = flatten(it)

test('Italian has exactly the English keys', () => {
  assert.deepEqual([...italian.keys()].sort(), [...english.keys()].sort())
})

test('no Italian message is empty', () => {
  for (const [key, value] of italian) {
    assert.ok(value.trim().length > 0, key)
  }
})

test('each Italian message takes the same arguments as the English one', () => {
  for (const [key, value] of english) {
    assert.deepEqual(
      argumentsOf(italian.get(key) ?? ''),
      argumentsOf(value),
      key
    )
  }
})
