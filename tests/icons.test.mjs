import { test } from 'node:test'
import assert from 'node:assert/strict'
import { iconStyles } from '../scripts/icons.mjs'

test('the 24px Explorer glyph is not clipped into the 16px control-icon viewport', async () => {
  const css = await iconStyles()
  const svgFor = name => decodeURIComponent(css.match(new RegExp(`\\.vsc-icon\\[data-icon="${name}"\\] \\{ mask: url\\("data:image/svg\\+xml,([^"\\n]+)`))[1])
  assert.match(svgFor('files'), /viewBox="0 0 24 24"/)
  assert.match(svgFor('new-file'), /viewBox="0 0 16 16"/)
})
