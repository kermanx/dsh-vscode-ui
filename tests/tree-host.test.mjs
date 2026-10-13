import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import React, { act, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { enhanceSidebarTree } from '../src/tree.js'

const h = React.createElement

// Keep the host's public rendering contract from ui-workspace/rows/Rows.tsx:
// React controls currentId's selected class and ARIA, folder clicks toggle,
// and session clicks invoke onOpen. The enhancement must coexist with React's
// diffing and batching; directly setting DOM attributes cannot exercise that.
const css = {
  projectRow: 'Rows_7c91_projectRow', sessionRow: 'Rows_7c91_sessionRow',
  selected: 'Rows_7c91_selected', title: 'Rows_7c91_title',
  chevron: 'Rows_7c91_chevron', treeBody: 'Rows_7c91_treeBody',
  menuOpen: 'Rows_7c91_menuOpen', rowActions: 'Rows_7c91_rowActions',
}

async function fixture({ autofocus = false } = {}) {
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  const { document } = dom.window
  Object.assign(globalThis, { window: dom.window, document, IS_REACT_ACT_ENVIRONMENT: true })
  const root = createRoot(document.getElementById('mount'))
  const opened = []
  let commands
  let restore

  function Host() {
    const [currentId, setCurrentId] = useState('alpha')
    const [expanded, setExpanded] = useState(true)
    const [revision, setRevision] = useState(0)
    const [menuOpen, setMenuOpen] = useState(false)
    const composer = useRef(null)
    // InputBar focuses on sessionId changes and may focus again after unlock.
    useEffect(() => { if (autofocus) composer.current?.focus() }, [currentId])
    commands = {
      setCurrentId,
      updateMetadata: () => setRevision(value => value + 1),
      toggleMenu: () => setMenuOpen(value => !value),
    }
    const onOpen = id => { opened.push(id); setCurrentId(id) }
    const session = id => h('div', {
      key: id,
      role: 'treeitem', 'data-row-key': `session:${id}`,
      className: [css.sessionRow, id === currentId && css.selected, menuOpen && css.menuOpen].filter(Boolean).join(' '),
      'aria-selected': id === currentId,
      onClick: () => onOpen(id),
    }, h('span', { className: css.title }, `${id} ${revision}`),
    h('span', { className: css.rowActions, onClick: event => event.stopPropagation() },
      h('button', { 'aria-label': `Actions for ${id}`, onClick: () => setMenuOpen(value => !value) }, 'Actions')))
    return h(React.Fragment, null,
      h('output', { 'aria-label': 'Open session' }, currentId ?? ''),
      h('div', { ref: composer, 'data-composer-input': true, role: 'textbox', tabIndex: 0 }),
      h('div', { 'data-slot': 'sidebar' },
        h('div', { className: css.treeBody },
          h('div', { role: 'tree', 'aria-label': 'Sessions' },
            h('div', { style: { '--dsh-workspace-indent': '0px' } },
              h('div', {
                role: 'treeitem', 'data-row-key': 'workspace:project',
                className: css.projectRow, 'aria-expanded': expanded,
                onClick: () => setExpanded(value => !value),
              }, h('span', { className: css.chevron }, h('svg', { 'aria-hidden': true })),
              h('span', { className: css.title }, `Workspace ${revision}`)),
              expanded && h('div', { role: 'group' }, session('nested'))),
            session('alpha'), session('beta')))))
  }

  const settle = async action => {
    await act(async () => {
      action?.()
      await new Promise(resolve => setTimeout(resolve, 0))
    })
  }
  await settle(() => root.render(h(Host)))
  restore = enhanceSidebarTree(document)
  await settle()
  const row = key => document.querySelector(`[role="treeitem"][data-row-key="${key}"]`)
  const tree = () => document.querySelector('[role="tree"]')
  const selected = () => [...document.querySelectorAll('[role="treeitem"][aria-selected="true"]')].map(item => item.dataset.rowKey)
  const current = () => document.querySelector('[aria-label="Open session"]').textContent
  const click = (element, init = {}) => settle(() => {
    element.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true, cancelable: true, ...init }))
    element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
  })
  const dispose = () => { restore?.(); restore = undefined }
  const close = async () => {
    dispose()
    await act(() => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
  return { dom, document, row, tree, selected, current, opened, click, settle, dispose, close, commands: () => commands }
}

test('React host updates preserve workspace selection and an explicitly cleared selection', async () => {
  const host = await fixture()
  try {
    assert.deepEqual(host.selected(), ['session:alpha'])
    const workspace = host.row('workspace:project')
    const alpha = host.row('session:alpha')
    await host.click(workspace.querySelector(`.${css.title}`))
    assert.deepEqual(host.selected(), ['workspace:project'])
    assert.equal(workspace.getAttribute('aria-expanded'), 'false', 'the native folder handler still runs')
    assert.equal(host.current(), 'alpha', 'local folder selection must not change the open session')
    assert.equal(alpha.classList.contains(css.selected), true, 'the host still identifies its open session')
    assert.equal(alpha.getAttribute('aria-selected'), 'false', 'the tree exposes its independent selection')

    await host.settle(() => { host.commands().updateMetadata(); host.commands().toggleMenu() })
    assert.deepEqual(host.selected(), ['workspace:project'], 'React title and class updates must not restore currentId selection')
    await host.click(workspace.querySelector('svg'))
    assert.equal(workspace.getAttribute('aria-expanded'), 'true')
    assert.deepEqual(host.selected(), ['workspace:project'], 'mounting child rows must preserve local selection')

    await host.click(host.tree())
    assert.deepEqual(host.selected(), [])
    await host.settle(() => { host.commands().updateMetadata(); host.commands().toggleMenu() })
    assert.deepEqual(host.selected(), [], 'unrelated React updates must preserve an explicit clear')
    assert.equal(host.current(), 'alpha')
    assert.deepEqual(host.opened, [])
  } finally { await host.close() }
})

test('React currentId changes synchronize selection and unloading restores the latest native ARIA', async () => {
  const host = await fixture()
  try {
    await host.click(host.row('workspace:project').querySelector(`.${css.title}`))
    await host.settle(() => host.commands().setCurrentId('beta'))
    assert.deepEqual(host.selected(), ['session:beta'])
    assert.equal(host.current(), 'beta')
    await host.click(host.tree())
    assert.deepEqual(host.selected(), [])
    await host.settle(() => host.commands().setCurrentId('alpha'))
    assert.deepEqual(host.selected(), ['session:alpha'], 'a real external session change replaces cleared selection')

    // Commit a native change, locally select a different row, then detach
    // before MutationObserver delivery. Cleanup must consume pending native
    // mutations and restore the latest host values, including no-op writes.
    await act(() => {
      flushSync(() => host.commands().setCurrentId('beta'))
      host.row('workspace:project').querySelector(`.${css.title}`).click()
      host.dispose()
    })
    assert.equal(host.row('session:alpha').getAttribute('aria-selected'), 'false')
    assert.equal(host.row('session:beta').getAttribute('aria-selected'), 'true')
    assert.equal(host.row('workspace:project').hasAttribute('aria-selected'), false)
    assert.equal(host.tree().hasAttribute('aria-multiselectable'), false)
    assert.equal(host.current(), 'beta')
    assert.deepEqual(host.opened, [])
  } finally { await host.close() }
})

test('twisties and row actions preserve selection while native session clicks open exactly once', async () => {
  const host = await fixture()
  try {
    const workspace = host.row('workspace:project')
    await host.click(workspace.querySelector('svg'))
    assert.equal(workspace.getAttribute('aria-expanded'), 'false')
    assert.deepEqual(host.selected(), ['session:alpha'])
    assert.equal(host.document.activeElement, workspace)
    await host.click(host.row('session:beta').querySelector('button'))
    assert.deepEqual(host.selected(), ['session:alpha'])
    assert.deepEqual(host.opened, [])
    await host.click(host.row('session:beta').querySelector(`.${css.title}`))
    assert.deepEqual(host.selected(), ['session:beta'])
    assert.equal(host.current(), 'beta')
    assert.deepEqual(host.opened, ['beta'], 'the enhancement must not invoke a second native click')
    await host.settle(() => host.commands().updateMetadata())
    assert.deepEqual(host.selected(), ['session:beta'])
  } finally { await host.close() }
})

test('single-select modifier clicks select the leaf without invoking the React open handler', async () => {
  const host = await fixture()
  try {
    assert.equal(host.tree().getAttribute('aria-multiselectable'), 'false')
    for (const modifier of ['shiftKey', 'ctrlKey', 'metaKey']) {
      await host.click(host.tree())
      await host.click(host.row('session:beta').querySelector(`.${css.title}`), { [modifier]: true })
      assert.deepEqual(host.selected(), ['session:beta'], `${modifier} keeps a single local selection`)
      assert.equal(host.current(), 'alpha', `${modifier} must not switch the editor's session`)
      assert.deepEqual(host.opened, [])
      await host.settle(() => host.commands().updateMetadata())
      assert.deepEqual(host.selected(), ['session:beta'], `${modifier} selection survives React's unchanged currentId`)
    }
    await host.click(host.row('session:beta').querySelector(`.${css.title}`))
    assert.equal(host.current(), 'beta')
    assert.deepEqual(host.selected(), ['session:beta'])
    assert.deepEqual(host.opened, ['beta'])
  } finally { await host.close() }
})

test('React unmounting and remounting the current child does not replace its workspace selection', async () => {
  const host = await fixture()
  try {
    await host.settle(() => host.commands().setCurrentId('nested'))
    assert.deepEqual(host.selected(), ['session:nested'])
    const workspace = host.row('workspace:project')
    await host.click(workspace.querySelector(`.${css.title}`))
    assert.equal(host.row('session:nested'), null)
    assert.deepEqual(host.selected(), ['workspace:project'])
    assert.equal(host.current(), 'nested')
    await host.click(workspace.querySelector('svg'))
    assert.ok(host.row('session:nested'))
    assert.deepEqual(host.selected(), ['workspace:project'], 'mounting the same currentId is not a session change')
    assert.equal(host.row('session:nested').classList.contains(css.selected), true)

    await host.click(host.tree())
    await host.click(workspace.querySelector('svg'))
    await host.click(workspace.querySelector('svg'))
    assert.deepEqual(host.selected(), [], 'remounting the current row must preserve a cleared selection')
    await host.settle(() => host.commands().setCurrentId('beta'))
    assert.deepEqual(host.selected(), ['session:beta'])
    assert.deepEqual(host.opened, [])
  } finally { await host.close() }
})

test('opening a session keeps tree focus across the host composer effect and delayed unlock', async () => {
  const host = await fixture({ autofocus: true })
  try {
    const composer = host.document.querySelector('[data-composer-input]')
    assert.equal(host.document.activeElement, composer)
    await host.click(host.row('session:beta'))
    assert.equal(host.current(), 'beta', 'native session opening still completes')
    assert.equal(host.document.activeElement, host.row('session:beta'), 'the session effect must not steal focus')
    assert.equal(host.tree().dataset.vscTreeActive, 'true')
    await host.settle(() => composer.focus())
    assert.equal(host.document.activeElement, host.row('session:beta'), 'a later unlock preserves the same intent')

    await host.settle(() => host.row('session:beta').dispatchEvent(new host.dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })))
    assert.equal(host.document.activeElement, host.row('session:alpha'))
    await host.settle(() => composer.focus())
    assert.equal(host.document.activeElement, host.row('session:alpha'), 'delayed focus follows subsequent tree navigation')

    await host.click(composer)
    await host.settle(() => composer.focus())
    assert.equal(host.document.activeElement, composer, 'an explicit composer pointer action releases tree focus')
    assert.equal(host.tree().dataset.vscTreeActive, 'false')
  } finally { await host.close() }
})

test('Tab, shortcuts, external navigation, and unloading release the tree open focus intent', async () => {
  const host = await fixture({ autofocus: true })
  try {
    const composer = host.document.querySelector('[data-composer-input]')
    for (const init of [{ key: 'Tab' }, { key: 'l', ctrlKey: true }]) {
      await host.click(host.row('session:beta'))
      await host.settle(() => {
        host.row('session:beta').dispatchEvent(new host.dom.window.KeyboardEvent('keydown', { bubbles: true, ...init }))
        composer.focus()
      })
      assert.equal(host.document.activeElement, composer)
    }
    await host.click(host.row('session:beta'))
    await host.settle(() => host.commands().setCurrentId('alpha'))
    assert.equal(host.document.activeElement, composer, 'returning externally to the previous session is a new navigation')
    await host.click(host.row('session:beta'))
    await host.settle(() => host.commands().setCurrentId('nested'))
    assert.equal(host.document.activeElement, composer, 'an unrelated external session change is not a tree open')
    await host.click(host.row('session:alpha'))
    host.dispose()
    composer.focus()
    assert.equal(host.document.activeElement, composer, 'unloading removes the focus policy')
  } finally { await host.close() }
})
