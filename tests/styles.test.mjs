import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { expandClasses, nativeClass } from '../src/selectors.js'

const treeStyles = expandClasses(await readFile(new URL('../src/tree.css', import.meta.url), 'utf8'))

test('native class selectors cover host, Vite, and filename-prefixed plugin CSS Modules', () => {
  const dom = new JSDOM('<body></body>')
  try {
    const element = dom.window.document.createElement('span')
    for (const name of ['hash_title', '_title_hash_1', 'recent_Rows-module_title_tePHdG']) {
      element.className = `other ${name} another`
      assert.equal(element.matches(nativeClass('title')), true, name)
    }
    for (const name of ['hash_subtitle', '_titleBar_hash', 'recent_Rows-module_titleGroup_tePHdG']) {
      element.className = name
      assert.equal(element.matches(nativeClass('title')), false, name)
    }
  } finally { dom.window.close() }
})

test('Classic tree keeps separate disclosure and icon lanes with recent-sessions CSS Modules', () => {
  const dom = new JSDOM(`<style>
    .recent_Rows-module_projectRow_hash .recent_Rows-module_chevron_hash { display: none; }
    .recent_Rows-module_slot_hash { width: 16px; height: 20px; }
    .recent_Rows-module_sessionRow_hash .recent_Rows-module_title_hash { margin: 0 6px 0 4px; }
    ${treeStyles}
  </style><div data-slot="sidebar"><div data-vsc-tree>
    <div role="treeitem" data-row-key="workspace:one" class="recent_Rows-module_projectRow_hash">
      <span id="folder" class="recent_Rows-module_slot_hash recent_Rows-module_folder_hash"></span>
      <span id="chevron" class="recent_Rows-module_slot_hash recent_Rows-module_chevron_hash"></span>
    </div>
    <div role="treeitem" data-row-key="session:one" aria-selected="true" class="recent_Rows-module_sessionRow_hash">
      <span id="status" class="recent_Rows-module_slot_hash"></span>
      <span id="title" class="recent_Rows-module_title_hash"></span>
      <span id="resting" class="recent_Rows-module_rowResting_hash"></span>
    </div>
  </div></div>`)
  try {
    const style = id => dom.window.getComputedStyle(dom.window.document.getElementById(id))
    assert.equal(style('chevron').display, 'inline-flex')
    assert.equal(style('chevron').order, '0')
    assert.equal(style('folder').order, '1')
    assert.equal(style('folder').marginRight, '6px')
    assert.equal(style('status').marginLeft, '22px')
    assert.equal(style('title').marginLeft, '0px')
    assert.equal(style('resting').display, 'none')
  } finally { dom.window.close() }
})
