import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { enhanceViewTabs } from '../src/tabs.js'

const settle = () => new Promise(resolve => setTimeout(resolve, 0))
function fixture() {
  return new JSDOM(`<!doctype html><body><button id="outside">Outside</button>
    <div id="session"><div data-conversation-tabs role="tablist">
      <button id="conversation" role="tab" aria-selected="true">Conversation</button>
      <button id="trajectory" role="tab" aria-selected="false">Trajectory</button>
    </div></div>
    <div data-dockkit-strip role="tablist"><div id="file" role="tab" tabindex="0">File</div></div>
  </body>`)
}
function press(window, target, key, init = {}) {
  const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

test('view tabs have one tab stop and wrap keyboard focus without selecting a view', async () => {
  const dom = fixture()
  const { document } = dom.window
  const dispose = enhanceViewTabs(document)
  try {
    const conversation = document.getElementById('conversation')
    const trajectory = document.getElementById('trajectory')
    assert.equal(conversation.tabIndex, 0)
    assert.equal(trajectory.tabIndex, -1)
    let activations = 0
    trajectory.addEventListener('click', () => activations++)
    conversation.focus()
    assert.equal(press(dom.window, conversation, 'ArrowRight').defaultPrevented, true)
    assert.equal(document.activeElement, trajectory)
    assert.equal(conversation.tabIndex, -1)
    assert.equal(trajectory.tabIndex, 0)
    assert.equal(trajectory.getAttribute('aria-selected'), 'false')
    assert.equal(activations, 0)
    assert.equal(press(dom.window, trajectory, 'Enter').defaultPrevented, false, 'native button activation is retained')
    assert.equal(press(dom.window, trajectory, ' ').defaultPrevented, false, 'native button activation is retained')
    assert.equal(press(dom.window, trajectory, 'ArrowLeft', { ctrlKey: true }).defaultPrevented, false)
    press(dom.window, trajectory, 'ArrowRight')
    assert.equal(document.activeElement, conversation)
    press(dom.window, conversation, 'ArrowLeft')
    assert.equal(document.activeElement, trajectory)
    press(dom.window, trajectory, 'Home')
    assert.equal(document.activeElement, conversation)
    press(dom.window, conversation, 'End')
    assert.equal(document.activeElement, trajectory)
    document.getElementById('outside').focus()
    await settle()
    assert.equal(conversation.tabIndex, 0, 'leaving the group restores the active view as its entry point')
    assert.equal(trajectory.tabIndex, -1)
    assert.equal(document.getElementById('file').tabIndex, 0, 'DockKit keeps its own focus policy')
  } finally { dispose(); dom.window.close() }
})

test('view tabs follow host selection and dynamic views, skip unavailable views, and restore on unload', async () => {
  const dom = fixture()
  const { document } = dom.window
  const conversation = document.getElementById('conversation')
  conversation.tabIndex = 4
  const list = document.querySelector('[data-conversation-tabs]')
  const dispose = enhanceViewTabs(document)
  try {
    const trajectory = document.getElementById('trajectory')
    conversation.setAttribute('aria-selected', 'false')
    trajectory.setAttribute('aria-selected', 'true')
    const added = document.createElement('button')
    added.setAttribute('role', 'tab')
    added.textContent = 'Details'
    list.append(added)
    await settle()
    assert.equal(trajectory.tabIndex, 0)
    assert.equal(added.tabIndex, -1)
    conversation.disabled = true
    conversation.setAttribute('aria-disabled', 'true')
    await settle()
    assert.equal(conversation.tabIndex, -1, 'unavailable tabs never remain in the native tab order')
    trajectory.focus()
    press(dom.window, trajectory, 'ArrowLeft')
    assert.equal(document.activeElement, added)
    document.getElementById('session').hidden = true
    await settle()
    assert.equal(list.hasAttribute('aria-orientation'), false)
    assert.equal(conversation.tabIndex, 4)
    document.getElementById('session').hidden = false
    conversation.disabled = false
    conversation.removeAttribute('aria-disabled')
    await settle()
    assert.equal(list.getAttribute('aria-orientation'), 'horizontal')
    added.remove()
    await settle()
    assert.equal(added.hasAttribute('tabindex'), false)
    dispose()
    assert.equal(conversation.tabIndex, 4)
    assert.equal(trajectory.hasAttribute('tabindex'), false)
    assert.equal(list.hasAttribute('aria-orientation'), false)
    conversation.focus()
    assert.equal(press(dom.window, conversation, 'ArrowRight').defaultPrevented, false)
  } finally { dispose(); dom.window.close() }
})

test('a dynamically opened trajectory inspector gets independent focus without taking over native tab widgets', async () => {
  const dom = fixture()
  const { document } = dom.window
  const dispose = enhanceViewTabs(document)
  try {
    const inspector = document.createElement('div')
    inspector.setAttribute('role', 'tablist')
    inspector.innerHTML = '<button role="tab" id="trajectory-detail-overview" aria-selected="true">Overview</button><button role="tab" id="trajectory-detail-input" aria-selected="false">Input</button>'
    document.body.append(inspector)
    const nativeTabs = document.createElement('div')
    nativeTabs.setAttribute('role', 'tablist')
    nativeTabs.innerHTML = '<button role="tab" data-detail-tab="rule" tabindex="0">Rule</button><button role="tab" data-detail-tab="records" tabindex="-1">Records</button>'
    document.body.append(nativeTabs)
    await settle()
    const [overview, input] = inspector.children
    overview.focus()
    press(dom.window, overview, 'ArrowRight')
    assert.equal(document.activeElement, input)
    assert.equal(input.getAttribute('aria-selected'), 'false')
    assert.equal(inspector.getAttribute('aria-orientation'), 'horizontal')
    assert.equal(nativeTabs.hasAttribute('aria-orientation'), false)
    assert.equal(press(dom.window, nativeTabs.firstElementChild, 'ArrowRight').defaultPrevented, false)
    inspector.replaceChildren()
    await settle()
    assert.equal(overview.hasAttribute('tabindex'), false)
    assert.equal(input.hasAttribute('tabindex'), false)
    assert.equal(inspector.hasAttribute('aria-orientation'), false, 'an empty inspector is released when its tab-dependent selector stops matching')
  } finally { dispose(); dom.window.close() }
})
