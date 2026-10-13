import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { classicTokens } from '../src/tokens.js'

test('workbench styles have a usable value for every color referenced without a fallback', async () => {
  const source = new URL('../src/', import.meta.url)
  for (const file of (await readdir(source)).filter(name => name.endsWith('.css'))) {
    const css = await readFile(new URL(file, source), 'utf8')
    for (const [, token] of css.matchAll(/var\((--vscode-[\w-]+)\s*\)/g)) {
      for (const mode of ['light', 'dark']) {
        const value = classicTokens[token]?.[mode]
        assert.ok(value && value !== 'initial', `${file}: ${token} has no usable ${mode} value or CSS fallback`)
      }
    }
  }
})

test('the dark tree keeps its focus-outline fallback while the light theme supplies its selected outline', () => {
  // Transparent would count as a valid color and hide the fallback outline.
  assert.equal(classicTokens['--vscode-list-focusAndSelectionOutline'].dark, 'initial')
  assert.equal(classicTokens['--vscode-list-focusAndSelectionOutline'].light, '#005FB8')
  assert.notEqual(classicTokens['--vscode-list-focusOutline'].dark, 'initial')
})

test('terminal surfaces honor their own palette role with an editor-surface fallback', () => {
  assert.equal(classicTokens['--vsc-terminal-background'].dark, '#191A1B')
  assert.equal(classicTokens['--vsc-terminal-background'].light, classicTokens['--vscode-editor-background'].light)
})
