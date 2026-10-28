import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

const require = createRequire(import.meta.url)
const compiled = await build({ entryPoints: ['src/Sidebar.jsx'], bundle: true, write: false, format: 'cjs', external: ['react', '@deepseek-ai/dsh-client-ui-primitives'] })
const output = { exports: {} }
runInNewContext(compiled.outputFiles[0].text, { module: output, exports: output.exports, require: id => id === '@deepseek-ai/dsh-client-ui-primitives' ? { Tooltip: ({ children }) => children } : require(id) })
const { Sidebar } = output.exports
const hostHooks = {
  useEntryPins: selector => selector([]),
  useEntryActions: selector => selector(false),
  useRemoteAccess: () => true,
  setPinned() {},
}

test('activity actions switch the sidebar, toggle current views, and support roving keyboard focus', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })
  const root = createRoot(document.getElementById('mount'))
  let panel = null
  let collapsed = false
  const selections = []
  let toggles = 0
  const render = () => root.render(React.createElement(Sidebar, {
    ...hostHooks, collapsed, width: 312, usePanels: selector => selector([{ id: 'plugins', label: 'Plugins' }, { id: 'schedules', label: 'Schedules' }]),
    usePanelInfo: selector => selector({ activePanelId: panel }), t: key => key,
    selectPanel: id => { selections.push(id); panel = id; if (id !== null) collapsed = false; render() },
    toggleSidebar: () => { collapsed = !collapsed; toggles++; render() }, startSession: () => {},
    renderSlot: () => null,
  }))
  const button = id => document.querySelector(`[data-activity-id="${id}"]`)
  try {
    await act(render)
    assert.equal(button('search'), null, 'search remains in the native explorer, outside the activity bar')
    assert.equal(document.querySelector('.vsc-global-actions button[aria-label="newSession"]'), null)
    assert.equal(document.querySelectorAll('button[aria-label="newSession"]').length, 1, 'the explorer title keeps New Session')
    await act(() => button('plugins').click())
    assert.deepEqual(selections, ['plugins'])
    assert.equal(document.querySelector('.vsc-sidebar-title > h2').textContent, 'Plugins')
    await act(() => button('plugins').click())
    assert.equal(collapsed, true)
    assert.equal(panel, 'plugins', 'closing retains selected view')
    assert.equal(button('plugins').hasAttribute('aria-current'), false)
    await act(() => button('plugins').click())
    assert.equal(collapsed, false)
    assert.equal(panel, 'plugins')
    await act(() => button('schedules').click())
    assert.equal(panel, 'schedules')
    assert.equal(toggles, 1, 'switching views does not collapse the sidebar')
    await act(() => button('explorer').click())
    assert.equal(panel, null)
    await act(() => { button('explorer').focus(); button('explorer').dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'End',bubbles:true})) })
    assert.equal(document.activeElement, button('schedules'))
    assert.equal(document.querySelectorAll('.vsc-activities button[tabindex="0"]').length, 1)
    await act(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowDown',bubbles:true})))
    assert.equal(document.activeElement, button('schedules'), 'vertical activity navigation stops at the last item')
    await act(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'Home',bubbles:true})))
    assert.equal(document.activeElement, button('explorer'))
    await act(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowDown',shiftKey:true,bubbles:true})))
    assert.equal(document.activeElement, button('explorer'), 'modified arrow keys remain available to the host')
    const actions = document.querySelectorAll('.vsc-title-actions button')
    await act(() => { actions[0].focus(); actions[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true})) })
    assert.equal(document.activeElement, actions[1])
    assert.equal(document.querySelectorAll('.vsc-title-actions button[tabindex="0"]').length, 1)
    await act(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowRight',bubbles:true})))
    assert.equal(document.activeElement, actions[0], 'horizontal title actions wrap as an ActionBar')
  } finally {
    await act(() => root.unmount()); dom.window.close()
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})

test('view opening focuses content and hiding a focused view returns focus to its activity', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })
  const root = createRoot(document.getElementById('mount'))
  let panel = null
  let collapsed = false
  const customIconStates = []
  const render = () => root.render(React.createElement(Sidebar, {
    ...hostHooks, collapsed, width: 312, usePanels: selector => selector([{ id: 'custom', label: 'Custom' }]),
    usePanelInfo: selector => selector({ activePanelId: panel }), t: key => key,
    selectPanel: id => { panel = id; if (id !== null) collapsed = false; render() },
    toggleSidebar: () => { collapsed = !collapsed; render() }, startSession: () => {},
    sidePanels: React.createElement('div', { 'data-side-panel': 'custom', hidden: collapsed || panel !== 'custom' }, React.createElement('button', { id: 'custom-content' }, 'Open item')),
    renderSlot: (slot, props) => {
      if (slot === 'sidebar.workspaces') return React.createElement('button', { id: 'session-search', 'aria-label': 'Session search' }, 'Search sessions')
      if (slot === 'sidebar.panellist') customIconStates.push(props.active)
      return null
    },
  }))
  const activity = id => document.querySelector(`[data-activity-id="${id}"]`)
  try {
    await act(render)
    const search = document.getElementById('session-search')
    await act(() => search.focus())
    await act(() => { panel = 'custom'; render() })
    assert.equal(document.activeElement, activity('custom'), 'external view switches do not leave focus in a hidden tree')
    await act(() => document.querySelector('button[aria-label="collapse"]').click())
    assert.equal(collapsed, true)
    assert.equal(document.activeElement, activity('custom'))
    assert.equal(customIconStates.at(-1), false, 'custom activity icons clear their active state while collapsed')
    await act(() => activity('custom').click())
    assert.equal(document.activeElement, document.getElementById('custom-content'))
    await act(() => { collapsed = true; render() })
    assert.equal(document.activeElement, activity('custom'), 'external collapse restores focus to the selected activity')
    await act(() => activity('explorer').click())
    assert.equal(document.activeElement, search)
    assert.equal(document.getElementById('session-search'), search, 'session content stays mounted across view switches')
  } finally {
    await act(() => root.unmount()); dom.window.close()
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})

test('session creation controls follow access changes and keep the title toolbar reachable', async () => {
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true })
  const root = createRoot(document.getElementById('mount'))
  let allowed = false
  let started = 0
  const props = {
    ...hostHooks, useRemoteAccess: action => { assert.equal(action, 'session/create'); return allowed },
    collapsed: false, sidePanels: null, usePanels: selector => selector([]),
    usePanelInfo: selector => selector({ activePanelId: null }), renderSlot: () => null,
    toggleSidebar() {}, selectPanel() {}, startSession: () => { started++ }, t: key => key,
  }
  const render = () => root.render(React.createElement(React.Fragment, null,
    React.createElement(Sidebar, props), React.createElement(output.exports.LeadingControls, props)))
  try {
    await act(render)
    assert.equal(document.querySelectorAll('[aria-label="newSession"]').length, 0)
    assert.equal(document.querySelector('[aria-label="collapse"]').tabIndex, 0)
    allowed = true
    await act(render)
    const buttons = document.querySelectorAll('[aria-label="newSession"]')
    assert.equal(buttons.length, 2)
    await act(() => { buttons[0].click(); buttons[1].click() })
    assert.equal(started, 2)
    allowed = false
    await act(render)
    assert.equal(document.querySelectorAll('[aria-label="newSession"]').length, 0)
  } finally {
    await act(() => root.unmount()); dom.window.close()
    delete globalThis.window; delete globalThis.document; delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
