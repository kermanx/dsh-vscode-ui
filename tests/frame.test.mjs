import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

const require = createRequire(import.meta.url)
const result = await build({ entryPoints: ['src/layout/AppFrame.tsx'], bundle: true, write: false, format: 'cjs', external: ['react'] })

test('changing and hiding sidebar views preserves the conversation draft and visited panel state', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })
  const module = { exports: {} }
  runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, require, document,
    ResizeObserver: class { observe() {} disconnect() {} }, setTimeout, clearTimeout })
  const { AppFrame } = module.exports
  let activePanelId = null
  let closed = false
  let mounts = 0
  function Conversation() {
    useEffect(() => { mounts++ }, [])
    return React.createElement('textarea', { 'aria-label': 'Draft', defaultValue: 'unsent message' })
  }
  function Panel({ id }) { return React.createElement('input', { 'aria-label': id, defaultValue: id }) }
  const renderSlot = (slot, props, options) => {
    if (slot === 'main') return options.entryKey === 'conversation' ? React.createElement(Conversation) : React.createElement(Panel, { id: options.entryKey })
    if (slot === 'sidebar') return React.createElement('aside', null, props.sidePanels)
    return null
  }
  const root = createRoot(document.getElementById('mount'))
  const actions = { setViewportWidth() {} }
  const usePanelInfo = selector => selector({ activePanelId })
  const useSessions = selector => selector({ byId: {} })
  const render = () => root.render(React.createElement(AppFrame, { useStore: selector => selector({ layoutInfo: {
    sidebar: closed ? 0 : 312, viewportWidth: 1280, narrowExpanded: false, rightbar: null,
    rightbarShown: false, rightbarTrack: false, rightbarFullscreen: false, rightbarInstant: false,
  } }), usePanelInfo, useSessions, actions, renderSlot, t: () => 'DSH' }))
  try {
    await act(render)
    const draft = document.querySelector('textarea')
    draft.value = 'in-progress draft'
    activePanelId = 'plugins'; await act(render)
    const pluginFilter = document.querySelector('input[aria-label="plugins"]')
    pluginFilter.value = 'remember filter'
    activePanelId = 'schedules'; await act(render)
    assert.equal(document.querySelector('[data-side-panel="plugins"]').hidden, true)
    activePanelId = 'plugins'; await act(render)
    assert.equal(document.querySelector('input[aria-label="plugins"]'), pluginFilter)
    assert.equal(pluginFilter.value, 'remember filter')
    closed = true; await act(render)
    assert.equal(document.querySelector('[data-side-panel="plugins"]').hidden, true)
    assert.equal(document.querySelector('textarea'), draft)
    assert.equal(draft.value, 'in-progress draft')
    assert.equal(mounts, 1)
  } finally {
    await act(() => root.unmount()); dom.window.close()
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
