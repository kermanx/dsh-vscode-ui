import { test } from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { runInNewContext } from 'node:vm'

async function load(path) {
  const bundle = await build({ entryPoints: [path], bundle: true, write: false, format: 'cjs', external: ['@deepseek-ai/dsh-client-store'] })
  const module = { exports: {} }
  runInNewContext(bundle.outputFiles[0].text, { module, exports: module.exports, window: { innerWidth: 1280 }, AbortController,
    require: () => ({ defineStore: spec => ({ spec }) }),
  })
  return module.exports
}
const { createLayoutStore } = await load('src/layout/stores.ts')
const { LayoutController } = await load('src/layout/service.ts')
const { computeColumns } = await load('src/layout/columns.ts')

test('sidebar restores resized width and preserves the selected view across collapse and responsive changes', () => {
  const { spec } = createLayoutStore()
  const state = spec.init()
  spec.actions.setSidebar(state, 378)
  spec.actions.selectPanel(state, 'plugins')
  spec.actions.toggleSidebar(state)
  assert.equal(state.layoutInfo.sidebar, 0)
  assert.equal(state.panelInfo.activePanelId, 'plugins')
  spec.actions.toggleSidebar(state)
  assert.equal(state.layoutInfo.sidebar, 378)
  spec.actions.setViewportWidth(state, 700)
  assert.equal(state.layoutInfo.narrowExpanded, false)
  spec.actions.selectPanel(state, 'schedules')
  assert.equal(state.layoutInfo.narrowExpanded, true)
  spec.actions.setViewportWidth(state, 1280)
  assert.equal(state.layoutInfo.sidebar, 378)
  assert.equal(state.panelInfo.activePanelId, 'schedules')
  spec.actions.retainMainPanels(state, ['plugins'])
  assert.equal(state.panelInfo.activePanelId, null)
  assert.equal(computeColumns(700, 0, 0).sidebar, 48)
})

test('layout retains DSH navigation cancellation and rejects missing panels before changing selection', () => {
  const selected = []
  const controller = new LayoutController({ selectPanel: id => selected.push(id) }, id => id === 'plugins', {})
  const first = controller.beginNavigation()
  const second = controller.beginNavigation()
  assert.equal(first.aborted, true)
  assert.throws(() => controller.selectPanel('missing'), /not registered/)
  assert.equal(second.aborted, false)
  assert.deepEqual(selected, [])
  controller.selectPanel('plugins')
  assert.equal(second.aborted, true)
  const third = controller.beginNavigation()
  controller.dispose()
  assert.equal(third.aborted, true)
})
