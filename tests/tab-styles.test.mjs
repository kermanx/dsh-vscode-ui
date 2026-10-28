import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { expandClasses } from '../src/selectors.js'

const tabStyles = expandClasses(await readFile(new URL('../src/dock.css', import.meta.url), 'utf8'))

test('conversation tabs neutralize expanded native hit margins and keep More in the same row', () => {
  const dom = new JSDOM(`<style>
    .hash_tabs { margin-top: 10px; padding-left: 8px; flex-wrap: wrap; }
    .hash_tab { margin: -10px -10px 0; padding: 10px 10px 9px; }
    .hash_viewsMore { margin-top: -3px; }
    ${tabStyles}
  </style><div class="hash_tabs" id="row">
    <div data-conversation-tabs role="tablist" id="list">
      <button class="hash_tab" role="tab" id="tab">Conversation</button>
    </div>
    <span><button class="hash_viewsMore" id="more">More</button></span>
  </div>`)
  try {
    const style = id => dom.window.getComputedStyle(dom.window.document.getElementById(id))
    assert.equal(style('tab').margin, '0px')
    assert.equal(style('tab').height, '35px')
    assert.equal(style('tab').padding, '0px 10px')
    assert.equal(style('row').marginTop, '0px')
    assert.equal(style('row').flexWrap, 'nowrap')
    assert.equal(style('list').flexWrap, 'nowrap')
    assert.equal(style('more').marginTop, '0px')
  } finally { dom.window.close() }
})
