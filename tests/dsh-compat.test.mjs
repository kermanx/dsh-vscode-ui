import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { relative, resolve, extname } from 'node:path'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

// Optional integration lane: exercise the shipped bundle against a DSH checkout,
// including an un-checked-out Git ref without changing that checkout or its index.
test('DSH runtime assembles the shipped plugin, menu extensions, access hooks and unload lifecycle', {
  skip: !process.env.DSH_SOURCE && 'Set DSH_SOURCE to a DSH checkout with installed dependencies',
}, async () => {
  const source = resolve(process.env.DSH_SOURCE)
  const ref = process.env.DSH_REF
  const revision = ref && execFileSync('git', ['-C', source, 'rev-parse', ref], { encoding: 'utf8' }).trim()
  const bundle = await build({
    stdin: {
      contents: `
        export { Context } from '@deepseek-ai/cordis';
        export { SlotRegistry } from './packages/client/ui-renderer/src/client/registry.ts';
        export { createSlotRenderer } from './packages/client/ui-renderer/src/client/scoped-slots.tsx';
        export { defineStore, createSnapshotStore } from '@deepseek-ai/dsh-client-store';
        export { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client';
        export { Menu } from './packages/client/ui-primitives/src/Menu.tsx';
      `,
      resolveDir: source,
    },
    tsconfig: resolve(source, 'tsconfig.base.json'),
    bundle: true, write: false, outdir: 'artifacts', format: 'cjs', platform: 'node', jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    loader: { '.css': 'empty' },
    plugins: revision ? [{
      name: 'dsh-git-source',
      setup(builder) {
        builder.onLoad({ filter: /\.[jt]sx?$/ }, args => {
          if (!args.path.startsWith(`${source}/`) || args.path.includes('/node_modules/')) return
          return {
            contents: execFileSync('git', ['-C', source, 'show', `${revision}:${relative(source, args.path)}`], {
              encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
            }),
            loader: extname(args.path).slice(1),
          }
        })
      },
    }] : [],
  })
  const dom = new JSDOM('<!doctype html><head></head><body><div id="mount"></div></body>', { pretendToBeVisual: true })
  const { window } = dom
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
  const ResizeObserver = class { observe() {} disconnect() {} }
  Object.assign(globalThis, { window, document: window.document, ResizeObserver, IS_REACT_ACT_ENVIRONMENT: true })
  const sandbox = {
    module: { exports: {} }, require: createRequire(import.meta.url), console,
    window, document, navigator: window.navigator, AbortController, ResizeObserver,
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, process, TextEncoder, TextDecoder,
    requestAnimationFrame: window.requestAnimationFrame.bind(window), cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    getComputedStyle: window.getComputedStyle.bind(window),
  }
  for (const key of ['HTMLElement', 'Element', 'Node', 'MutationObserver', 'Event', 'ShadowRoot']) sandbox[key] = window[key]
  sandbox.exports = sandbox.module.exports
  runInNewContext(bundle.outputFiles.find(file => file.path.endsWith('.js')).text, sandbox)
  const { Context, SlotRegistry, createSlotRenderer, defineStore, createSnapshotStore, LocaleRuntime, Menu } = sandbox.module.exports
  const ctx = new Context()
  const root = createRoot(document.getElementById('mount'))
  let fiber
  try {
    await ctx.plugin(SlotRegistry).await()
    const locale = new LocaleRuntime(ctx)
    ctx.provide('locale', locale)
    ctx.slots.installLocale(locale)
    ctx.slots.install(createSlotRenderer())
    const sessionBinding = createSnapshotStore({ key: undefined, hooks: {}, keyedHooks: {}, props: {} })
    ctx.slots.installScope('session', { current: sessionBinding, bindingSource: () => sessionBinding })
    ctx.provide('shortcuts', { register: () => () => {} })
    ctx.provide('theme', {
      overrideTokens: () => () => {},
      getTheme: () => ({ active: { colorScheme: 'light', tokens: {} }, fontSizes: { text: 14, code: 13, terminal: 13 }, fontFamilies: { text: '', code: '', terminal: '' } }),
    })
    const access = createSnapshotStore(true)
    ctx.slots.provideRoot({ hooks: { sessions: createSnapshotStore({ byId: {} }) }, keyedHooks: { remoteAccess: () => access } })
    const started = []
    ctx.provide('uiWorkspace', { startSession: (...args) => started.push(args) })
    let plugin
    window.__ModuleLoader__ = { load({ id, factory }) {
      assert.equal(id, 'dsh-vscode-ui')
      plugin = factory(name => name === '@deepseek-ai/dsh-client-store' ? { defineStore, createSnapshotStore }
        : name === '@deepseek-ai/dsh-client-ui-primitives' ? { Menu, Tooltip: ({ children }) => children } : sandbox.require(name))
    } }
    runInNewContext(await readFile(new URL('../dist/client.js', import.meta.url), 'utf8'), sandbox)
    fiber = ctx.plugin(plugin)
    await fiber.await()
    assert.equal(ctx.slots.entries('root').length, 1)
    assert.equal(ctx.slots.entries('sidebar').length, 1)
    assert.ok(ctx.slots.spec('sidebar.panellist.actions'))
    const disposePanel = ctx.slots.register({ name: 'main', key: 'custom' }, () => React.createElement('input', { 'aria-label': 'Custom panel' }))
    ctx.slots.register({ name: 'sidebar.panellist', id: 'custom', label: 'Custom' }, () => null)
    ctx.slots.register({ name: 'sidebar.panellist', id: 'plugins', label: 'Plugins' }, () => null)
    ctx.slots.register({ name: 'main', key: 'conversation' }, () => React.createElement('textarea', { 'aria-label': 'Draft', defaultValue: 'keep draft' }))
    let menuProps
    const disposeMenu = ctx.slots.register({ name: 'sidebar.panellist.actions', id: 'custom-menu' }, props => {
      menuProps = props
      return React.createElement('button', { role: 'menuitem', onClick: () => props.onOpen('custom') }, 'Open custom')
    })
    await act(() => root.render(ctx.slots.renderSlot('root', {})))
    const draft = document.querySelector('textarea')
    assert.ok(draft)
    const more = () => document.querySelector('[data-activity-id="more"]')
    await act(() => more().click())
    assert.deepEqual(Array.from(menuProps.entries, item => item.id), ['custom'])
    await act(() => menuProps.onPinnedChange('custom', false))
    assert.equal(document.querySelector('[data-activity-id="custom"]'), null)
    assert.equal(menuProps.entries[0].pinned, false)
    await act(() => menuProps.onOpen('custom'))
    assert.equal(more().getAttribute('aria-expanded'), 'false')
    assert.ok(document.querySelector('[data-activity-id="custom"]'), 'an unpinned active panel still has a launcher')
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Custom panel')
    assert.equal(document.querySelector('textarea'), draft)
    await act(() => more().click())
    await act(() => menuProps.onOpen('custom'))
    assert.equal(document.querySelector('.vsc-explorer').hidden, false, 'menu opening the current panel must not collapse it')
    await act(disposePanel)
    assert.equal(ctx.layout.panelInfo.getSnapshot().activePanelId, null)
    assert.equal(document.querySelector('[data-activity-id="custom"]'), null)
    assert.equal(document.querySelector('textarea'), draft)
    assert.equal(document.querySelectorAll('.vsc-title-actions button').length, 2)
    await act(() => access.set(false))
    assert.equal(document.querySelectorAll('.vsc-title-actions button').length, 1)
    assert.equal(document.querySelector('.vsc-title-actions button').tabIndex, 0)
    await act(() => access.set(true))
    await act(() => document.querySelector('.vsc-title-actions button').click())
    assert.equal(started.length, 1)
    await act(disposeMenu)
    assert.equal(more(), null)
    await act(() => root.unmount())
    await fiber.dispose()
    fiber = undefined
    assert.equal(ctx.slots.entries('root').length, 0)
    assert.equal(document.querySelector('style[data-plugin="dsh-vscode-ui"]'), null)
  } finally {
    await act(() => root.unmount())
    await fiber?.dispose()
    await ctx.fiber.dispose()
    window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.ResizeObserver
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
