import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { enhanceSidebarTree } from '../src/tree.js'

function fixture() {
  return new JSDOM(`<!doctype html><body><button id="outside">Outside</button>
    <div data-slot="sidebar"><div role="tree">
      <div id="rootGroup" style="--dsh-workspace-indent: 0px">
        <span><div id="root" class="hash_projectRow" role="treeitem" data-row-key="workspace:root" aria-expanded="true"><span class="hash_chevron"><svg></svg></span><span class="hash_title">Project</span><button id="action">More</button></div></span>
        <div role="group"><div id="childGroup" style="--dsh-workspace-indent: 12px">
          <span><div id="child" class="hash_projectRow" role="treeitem" data-row-key="workspace:child" aria-expanded="true"><span class="hash_chevron"><svg></svg></span><span class="hash_title">Nested</span></div></span>
          <span><div id="leaf" class="hash_sessionRow hash_selected" role="treeitem" data-row-key="session:leaf" aria-selected="true"><span class="hash_title">Research</span></div></span>
        </div></div>
        <span><div id="sibling" class="hash_sessionRow" role="treeitem" data-row-key="session:sibling" aria-selected="false"><span class="hash_title">Refactor</span></div></span>
      </div>
    </div></div></body>`)
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0))

test('search navigation transfers focus to the revealed native session and ignores inert exit copies', async () => {
  const dom = new JSDOM('<!doctype html><body><div data-slot="sidebar"><div role="tree"><div role="treeitem" class="hash_searchResultRow">Search result</div></div></div><div data-composer-input tabindex="0"></div></body>')
  const { document } = dom.window
  const dispose = enhanceSidebarTree(document)
  try {
    const result = document.querySelector('[role="treeitem"]')
    const composer = document.querySelector('[data-composer-input]')
    result.addEventListener('click', () => {
      document.querySelector('[data-slot="sidebar"]').innerHTML = '<div role="tree"><div role="treeitem" data-row-key="session:found" class="hash_sessionRow hash_selected" aria-selected="true">Found</div><div inert aria-hidden="true"><div role="treeitem" class="hash_selected" aria-selected="true">Old animated copy</div></div></div>'
      composer.focus()
    })
    result.click()
    await settle()
    const revealed = document.querySelector('[data-row-key="session:found"]')
    assert.equal(document.activeElement, revealed)
    assert.equal(revealed.closest('[role="tree"]').dataset.vscTreeActive, 'true')
    assert.equal(document.querySelector('[inert] [role="treeitem"]').hasAttribute('data-vsc-tree-focused'), false)
    dispose()
    composer.focus()
    assert.equal(document.activeElement, composer)
  } finally { dispose(); dom.window.close() }
})

test('search focus waits for the native reveal when its target is mounted after the tree replacement', async () => {
  const dom = new JSDOM('<!doctype html><body><div data-slot="sidebar"><div role="tree"><div role="treeitem" class="hash_searchResultRow">Search result</div></div></div><div data-composer-input tabindex="0"></div></body>')
  const { document } = dom.window
  const dispose = enhanceSidebarTree(document)
  try {
    const composer = document.querySelector('[data-composer-input]')
    const result = document.querySelector('[role="treeitem"]')
    result.addEventListener('click', () => {
      document.querySelector('[data-slot="sidebar"]').innerHTML = '<div role="tree"><div role="treeitem" data-row-key="workspace:folder" aria-expanded="false">Folder</div></div>'
      composer.focus()
    })
    result.click()
    const tree = document.querySelector('[role="tree"]')
    assert.equal(document.activeElement, tree, 'do not focus an unrelated folder while waiting for the reveal')
    const revealed = document.createElement('div')
    revealed.setAttribute('role', 'treeitem')
    revealed.setAttribute('aria-selected', 'true')
    revealed.className = 'hash_sessionRow hash_selected'
    revealed.dataset.rowKey = 'session:found'
    tree.append(revealed)
    await settle()
    assert.equal(document.activeElement, revealed)
    assert.equal(tree.dataset.vscTreeActive, 'true')
  } finally { dispose(); dom.window.close() }
})

function press(window, element, key, init = {}) {
  const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  element.dispatchEvent(event)
  return event
}

test('tree focus follows hierarchy while Enter delegates activation to DSH', async () => {
  const dom = fixture()
  const { document } = dom.window
  const dispose = enhanceSidebarTree(document)
  try {
    const root = document.getElementById('root')
    const child = document.getElementById('child')
    const leaf = document.getElementById('leaf')
    const sibling = document.getElementById('sibling')
    assert.equal(leaf.tabIndex, 0)
    assert.equal(root.getAttribute('aria-level'), '1')
    assert.equal(child.getAttribute('aria-level'), '2')
    assert.equal(leaf.getAttribute('aria-level'), '3')
    assert.equal(sibling.getAttribute('aria-level'), '2')
    assert.equal(child.getAttribute('aria-setsize'), '2')
    assert.equal(sibling.getAttribute('aria-posinset'), '2')
    assert.equal(document.getElementById('childGroup').dataset.vscTreeGroup, 'active')
    assert.equal(document.getElementById('rootGroup').dataset.vscTreeGroup, 'inactive')
    leaf.focus()
    press(dom.window, leaf, 'ArrowLeft')
    assert.equal(document.activeElement, child)
    press(dom.window, child, 'ArrowRight')
    assert.equal(document.activeElement, leaf)
    press(dom.window, leaf, 'End')
    assert.equal(document.activeElement, sibling)
    let opened = 0
    sibling.addEventListener('click', () => opened++)
    press(dom.window, sibling, 'Enter')
    assert.equal(opened, 1)
    assert.equal(sibling.getAttribute('aria-selected'), 'true', 'Enter selects independently while DSH handles opening')
    press(dom.window, sibling, 'Home')
    assert.equal(document.activeElement, root)
    let toggles = 0
    root.addEventListener('click', () => toggles++)
    press(dom.window, root, 'ArrowLeft')
    assert.equal(toggles, 1)
    document.getElementById('action').focus()
    press(dom.window, document.activeElement, 'ArrowDown')
    assert.equal(document.activeElement.id, 'action', 'row navigation does not consume action keys')
    await settle()
    assert.equal(document.querySelectorAll('[role="treeitem"][tabindex="0"]').length, 1)
  } finally { dispose(); dom.window.close() }
})

test('dynamic rows join the tree and unloading restores original DOM attributes and listeners', async () => {
  const dom = fixture()
  const { document } = dom.window
  const leaf = document.getElementById('leaf')
  leaf.tabIndex = 4
  const dispose = enhanceSidebarTree(document)
  const row = document.createElement('div')
  row.setAttribute('role', 'treeitem')
  row.dataset.rowKey = 'session:added'
  document.getElementById('childGroup').append(row)
  await settle()
  assert.equal(row.getAttribute('aria-level'), '3')
  assert.equal(row.getAttribute('aria-setsize'), '2')
  document.getElementById('childGroup').remove()
  await settle()
  assert.equal(row.hasAttribute('aria-level'), false)
  assert.equal(leaf.tabIndex, 4)
  dispose()
  assert.equal(document.querySelector('[data-vsc-tree]'), null)
  assert.equal(document.querySelector('[data-vsc-tree-group]'), null)
  assert.equal(document.getElementById('root').hasAttribute('tabindex'), false)
  const root = document.getElementById('root')
  root.tabIndex = 0
  root.focus()
  press(dom.window, root, 'ArrowDown')
  assert.equal(document.activeElement, root)
  dom.window.close()
})

test('Space toggles folders without opening a session; search and overflow rows share navigation', async () => {
  const dom = fixture()
  const { document } = dom.window
  const tree = document.querySelector('[role="tree"]')
  const search = document.createElement('div')
  search.setAttribute('role', 'treeitem')
  search.innerHTML = '<span class="hash_searchResultTitle">Zebra</span>'
  tree.append(search)
  const overflow = document.createElement('button')
  overflow.dataset.rowKey = 'overflow:root'
  overflow.textContent = 'More sessions'
  tree.append(overflow)
  const dispose = enhanceSidebarTree(document)
  try {
    const leaf = document.getElementById('leaf')
    let opened = 0
    leaf.addEventListener('click', () => opened++)
    leaf.focus()
    press(dom.window, leaf, ' ')
    assert.equal(opened, 0)
    press(dom.window, leaf, 'z')
    assert.equal(document.activeElement, search)
    press(dom.window, search, 'PageDown')
    assert.equal(document.activeElement, overflow)
    assert.equal(overflow.getAttribute('role'), 'treeitem')
    press(dom.window, overflow, 'PageUp')
    assert.equal(document.activeElement.id, 'root')
    document.querySelector('[data-slot="sidebar"]').hidden = true
    await settle()
    assert.equal(tree.hasAttribute('data-vsc-tree'), false)
    document.querySelector('[data-slot="sidebar"]').hidden = false
    await settle()
    assert.equal(tree.hasAttribute('data-vsc-tree'), true)
  } finally { dispose(); dom.window.close() }
})

test('tree navigation keeps focus, selection, and action focus independent across blur', async () => {
  const dom = fixture()
  const { document } = dom.window
  const dispose = enhanceSidebarTree(document)
  try {
    const tree = document.querySelector('[role="tree"]')
    const root = document.getElementById('root')
    const leaf = document.getElementById('leaf')
    const sibling = document.getElementById('sibling')
    const action = document.getElementById('action')
    assert.equal(tree.dataset.vscTreeActive, 'false')
    leaf.focus()
    press(dom.window, leaf, 'ArrowDown')
    await settle()
    assert.equal(document.activeElement, sibling)
    assert.equal(tree.dataset.vscTreeActive, 'true')
    assert.equal(sibling.dataset.vscTreeFocused, 'true')
    assert.equal(leaf.dataset.vscTreeFocused, 'false')
    assert.equal(leaf.getAttribute('aria-selected'), 'true', 'arrow navigation does not change the open session')
    assert.equal(document.getElementById('rootGroup').dataset.vscTreeGroup, 'active')
    assert.equal(document.getElementById('childGroup').dataset.vscTreeGroup, 'active', 'selection and focus both keep their parent guides active')

    document.getElementById('outside').focus()
    await settle()
    assert.equal(tree.dataset.vscTreeActive, 'false')
    assert.equal(sibling.dataset.vscTreeFocused, 'true', 'blur retains the focus row for actions and returning navigation')
    assert.equal(sibling.tabIndex, 0)
    sibling.focus()
    press(dom.window, sibling, 'Home')
    await settle()
    assert.equal(root.dataset.vscTreeFocused, 'true')
    action.focus()
    await settle()
    assert.equal(tree.dataset.vscTreeActive, 'false', 'an action focus does not paint active tree selection')
    assert.equal(root.dataset.vscTreeFocused, 'true')
    press(dom.window, action, 'ArrowDown')
    assert.equal(document.activeElement, action, 'the action owns its keyboard input')
    dispose()
    assert.equal(document.querySelector('[data-vsc-tree-active]'), null)
    assert.equal(document.querySelector('[data-vsc-tree-focused]'), null)
  } finally { dispose(); dom.window.close() }
})

test('native row replacements retain the returning focus position by stable session key', async () => {
  const dom = fixture()
  const { document } = dom.window
  const dispose = enhanceSidebarTree(document)
  try {
    const sibling = document.getElementById('sibling')
    sibling.focus()
    await settle()
    document.getElementById('outside').focus()
    await settle()
    const replacement = document.createElement('div')
    replacement.setAttribute('role', 'treeitem')
    replacement.dataset.rowKey = sibling.dataset.rowKey
    replacement.setAttribute('aria-selected', 'false')
    replacement.textContent = 'Updated session title'
    sibling.replaceWith(replacement)
    await settle()
    assert.equal(replacement.tabIndex, 0)
    assert.equal(replacement.dataset.vscTreeFocused, 'true')
    assert.equal(sibling.hasAttribute('data-vsc-tree-focused'), false)
    assert.equal(document.querySelector('[role="tree"]').dataset.vscTreeActive, 'false')
    replacement.focus()
    press(dom.window, replacement, 'ArrowUp')
    assert.equal(document.activeElement.id, 'leaf')
  } finally { dispose(); dom.window.close() }
})

test('paging uses the visible row height for two-line session search results', () => {
  const dom = new JSDOM('<!doctype html><body><div data-slot="sidebar"><div role="tree"></div></div></body>')
  const { document } = dom.window
  const tree = document.querySelector('[role="tree"]')
  Object.defineProperty(tree, 'clientHeight', { value: 220 })
  const rows = Array.from({ length: 12 }, (_, index) => {
    const row = document.createElement('div')
    row.setAttribute('role', 'treeitem')
    row.textContent = `Search result ${index + 1}`
    row.getBoundingClientRect = () => ({ height: 44 })
    tree.append(row)
    return row
  })
  const dispose = enhanceSidebarTree(document)
  try {
    rows[0].focus()
    press(dom.window, rows[0], 'PageDown')
    assert.equal(document.activeElement, rows[4], 'one page reveals five two-line results, not ten single-line rows')
    press(dom.window, rows[4], 'PageUp')
    assert.equal(document.activeElement, rows[0])
  } finally { dispose(); dom.window.close() }
})

test('context-menu keys only open menu triggers and hand focus to their native keyboard handler', async () => {
  const dom = fixture()
  const { document } = dom.window
  const tree = document.querySelector('[role="tree"]')
  const search = document.createElement('div')
  search.setAttribute('role', 'treeitem')
  search.innerHTML = '<span class="hash_searchResultHeading"><span class="hash_rowActions"><button>Unarchive</button></span></span>'
  tree.append(search)
  const leaf = document.getElementById('leaf')
  leaf.insertAdjacentHTML('beforeend', '<span class="hash_rowActions"><span class="hash_root"><button id="menu">More</button></span><button id="pin">Pin</button></span>')
  const trigger = document.getElementById('menu')
  let menuOpens = 0
  let otherActions = 0
  trigger.addEventListener('click', () => {
    assert.equal(document.activeElement, trigger, 'native Menu needs its anchor focused when it opens')
    menuOpens++
  })
  search.querySelector('button').addEventListener('click', () => otherActions++)
  document.getElementById('pin').addEventListener('click', () => otherActions++)
  const dispose = enhanceSidebarTree(document)
  try {
    search.focus()
    assert.equal(press(dom.window, search, 'ContextMenu').defaultPrevented, false)
    assert.equal(press(dom.window, search, 'F10', { shiftKey: true }).defaultPrevented, false)
    assert.equal(otherActions, 0, 'requesting a menu never invokes an ordinary row action')
    for (const [key, init] of [['ContextMenu', {}], ['F10', { shiftKey: true }]]) {
      leaf.focus()
      assert.equal(press(dom.window, leaf, key, init).defaultPrevented, true)
      assert.equal(document.activeElement, trigger)
      press(dom.window, trigger, 'ArrowDown')
      assert.equal(document.activeElement, trigger, 'tree navigation releases keys to the menu anchor')
    }
    await settle()
    assert.equal(menuOpens, 2)
    assert.equal(tree.dataset.vscTreeActive, 'false')
    assert.equal(leaf.dataset.vscTreeFocused, 'true')
    assert.equal(otherActions, 0)
  } finally { dispose(); dom.window.close() }
})

const selectedIds = document => [...document.querySelectorAll('[data-vsc-tree] [aria-selected="true"]')].map(row => row.id)

// Model React's current-session rendering, including no-op attribute writes
// when the enhancement has already exposed the same value for local selection.
function nativeCurrent(document, id) {
  for (const row of document.querySelectorAll('[data-row-key^="session:"]')) {
    row.classList.toggle('hash_selected', row.id === id)
    row.setAttribute('aria-selected', String(row.id === id))
  }
}

test('folder labels select locally; twisties and expansion keys preserve selection and native opening', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const child = document.getElementById('child')
  const leaf = document.getElementById('leaf')
  let rootToggles = 0
  let childToggles = 0
  let opened = 0
  root.addEventListener('click', () => {
    rootToggles++
    root.setAttribute('aria-expanded', String(root.getAttribute('aria-expanded') !== 'true'))
  })
  child.addEventListener('click', () => {
    childToggles++
    child.setAttribute('aria-expanded', String(child.getAttribute('aria-expanded') !== 'true'))
  })
  leaf.addEventListener('click', () => opened++)
  const dispose = enhanceSidebarTree(document)
  try {
    assert.equal(document.querySelector('[role="tree"]').getAttribute('aria-multiselectable'), 'false')
    root.querySelector('.hash_title').click()
    await settle()
    assert.deepEqual(selectedIds(document), ['root'], 'selecting a workspace clears the old session highlight')
    assert.equal(leaf.classList.contains('hash_selected'), true, 'DSH keeps its current session')
    assert.equal(rootToggles, 1, 'a label click retains native expand-on-label behavior')
    assert.equal(opened, 0)
    press(dom.window, root, 'Enter')
    assert.equal(rootToggles, 1, 'Enter selects folders without toggling them')
    child.querySelector('svg').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    await settle()
    assert.deepEqual(selectedIds(document), ['root'], 'clicking inside the twistie only focuses and toggles')
    assert.equal(childToggles, 1)
    assert.equal(document.activeElement, child)
    press(dom.window, child, 'ArrowRight')
    press(dom.window, child, 'ArrowLeft')
    press(dom.window, child, ' ')
    await settle()
    assert.equal(childToggles, 4)
    assert.deepEqual(selectedIds(document), ['root'], 'keyboard expansion never selects the folder')
    leaf.focus()
    press(dom.window, leaf, 'Enter')
    await settle()
    assert.equal(opened, 1)
    assert.deepEqual(selectedIds(document), ['leaf'])
  } finally { dispose(); dom.window.close() }
})

test('Escape and empty-tree clicks clear local selection without reopening or closing the native session', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const tree = document.querySelector('[role="tree"]')
  let nativeClicks = 0
  document.getElementById('leaf').addEventListener('click', () => nativeClicks++)
  const dispose = enhanceSidebarTree(document)
  try {
    root.click()
    assert.equal(press(dom.window, root, 'Escape').defaultPrevented, true)
    await settle()
    assert.deepEqual(selectedIds(document), [])
    assert.equal(root.dataset.vscTreeFocused, 'true', 'Escape retains navigation focus')
    assert.equal(press(dom.window, root, 'Escape').defaultPrevented, false, 'an already empty selection does not consume Escape')
    root.setAttribute('aria-expanded', 'false')
    await settle()
    assert.deepEqual(selectedIds(document), [], 'incidental refreshes cannot reselect the current session')
    root.click()
    tree.click()
    await settle()
    assert.deepEqual(selectedIds(document), [])
    assert.equal(document.querySelectorAll('[data-vsc-tree-focused="true"]').length, 0)
    assert.equal(document.activeElement, tree)
    assert.equal(tree.dataset.vscTreeActive, 'true')
    press(dom.window, tree, 'ArrowDown')
    assert.equal(document.activeElement, root, 'navigation resumes from the first row after a blank click')
    assert.deepEqual(selectedIds(document), [])
    assert.equal(document.getElementById('leaf').classList.contains('hash_selected'), true)
    assert.equal(nativeClicks, 0)
  } finally { dispose(); dom.window.close() }
})

test('native session changes replace local selection once and unload restores the latest native ARIA', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const leaf = document.getElementById('leaf')
  const sibling = document.getElementById('sibling')
  const tree = document.querySelector('[role="tree"]')
  const dispose = enhanceSidebarTree(document)
  try {
    root.click()
    // Do not settle first: this batch mixes our own ARIA writes and native
    // writes to the exact same attributes, including false -> false.
    nativeCurrent(document, 'sibling')
    await settle()
    assert.deepEqual(selectedIds(document), ['sibling'])
    root.click()
    await settle()
    sibling.classList.add('hash_menuOpen')
    sibling.querySelector('.hash_title').textContent = 'Renamed session'
    nativeCurrent(document, 'sibling')
    await settle()
    assert.deepEqual(selectedIds(document), ['root'], 'rewriting the same native current session preserves local selection')
    assert.equal(sibling.getAttribute('aria-selected'), 'false')
    nativeCurrent(document, 'leaf')
    await settle()
    assert.deepEqual(selectedIds(document), ['leaf'])
    root.click()
    dispose()
    assert.equal(root.hasAttribute('aria-selected'), false)
    assert.equal(leaf.getAttribute('aria-selected'), 'true')
    assert.equal(sibling.getAttribute('aria-selected'), 'false')
    assert.equal(tree.hasAttribute('aria-multiselectable'), false)
    assert.equal(tree.hasAttribute('tabindex'), false)
  } finally { dispose(); dom.window.close() }
})

test('folder selection survives row replacement, collapsed-session remounts, and sidebar hiding', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const sidebar = document.querySelector('[data-slot="sidebar"]')
  const childGroup = document.getElementById('childGroup')
  const leaf = document.getElementById('leaf')
  const dispose = enhanceSidebarTree(document)
  try {
    root.click()
    await settle()
    const replacement = root.cloneNode(true)
    replacement.removeAttribute('aria-selected')
    replacement.removeAttribute('data-vsc-tree-focused')
    root.replaceWith(replacement)
    await settle()
    assert.deepEqual(selectedIds(document), ['root'])
    assert.equal(replacement.dataset.vscTreeFocused, 'true')
    leaf.remove()
    await settle()
    assert.deepEqual(selectedIds(document), ['root'])
    const remountedLeaf = document.createElement('div')
    remountedLeaf.id = 'leaf'
    remountedLeaf.dataset.rowKey = 'session:leaf'
    remountedLeaf.className = 'hash_sessionRow hash_selected'
    remountedLeaf.setAttribute('role', 'treeitem')
    remountedLeaf.setAttribute('aria-selected', 'true')
    childGroup.append(remountedLeaf)
    await settle()
    assert.deepEqual(selectedIds(document), ['root'], 'revealing the same open session does not reset workspace selection')
    sidebar.hidden = true
    await settle()
    assert.equal(replacement.hasAttribute('aria-selected'), false)
    assert.equal(remountedLeaf.getAttribute('aria-selected'), 'true')
    sidebar.hidden = false
    await settle()
    assert.deepEqual(selectedIds(document), ['root'])
    press(dom.window, replacement, 'Escape')
    sidebar.hidden = true
    await settle()
    sidebar.hidden = false
    await settle()
    assert.deepEqual(selectedIds(document), [], 'hiding preserves an explicitly cleared selection too')
  } finally { dispose(); dom.window.close() }
})

test('clicking row actions preserves selection and pointer focus never scrolls the click target', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const sibling = document.getElementById('sibling')
  const action = document.getElementById('action')
  let reveals = 0
  let actionClicks = 0
  root.scrollIntoView = sibling.scrollIntoView = () => reveals++
  action.addEventListener('click', event => { event.stopPropagation(); actionClicks++ })
  const dispose = enhanceSidebarTree(document)
  try {
    root.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true }))
    root.click()
    assert.equal(reveals, 0, 'mouse focus must not move the row under the pointer')
    action.focus()
    action.click()
    await settle()
    assert.equal(actionClicks, 1)
    assert.deepEqual(selectedIds(document), ['root'])
    assert.equal(document.activeElement, action)
    assert.equal(document.querySelector('[role="tree"]').dataset.vscTreeActive, 'false')
    root.focus()
    press(dom.window, root, 'End')
    assert.equal(reveals, 1, 'keyboard navigation reveals its destination')
    assert.deepEqual(selectedIds(document), ['root'])
  } finally { dispose(); dom.window.close() }
})

test('native deselection while the sidebar is hidden is applied on reopening', async () => {
  const dom = fixture()
  const { document } = dom.window
  const sidebar = document.querySelector('[data-slot="sidebar"]')
  const dispose = enhanceSidebarTree(document)
  try {
    document.getElementById('root').click()
    sidebar.hidden = true
    await settle()
    nativeCurrent(document, undefined)
    await settle()
    sidebar.hidden = false
    await settle()
    assert.deepEqual(selectedIds(document), [])
  } finally { dispose(); dom.window.close() }
})

test('modified leaf clicks select without opening while folder and row actions retain native behavior', async () => {
  const dom = fixture()
  const { document } = dom.window
  const root = document.getElementById('root')
  const sibling = document.getElementById('sibling')
  const action = document.getElementById('action')
  let opens = 0
  let toggles = 0
  let actions = 0
  sibling.addEventListener('click', () => opens++)
  root.addEventListener('click', () => toggles++)
  action.addEventListener('click', event => { event.stopPropagation(); actions++ })
  const dispose = enhanceSidebarTree(document)
  try {
    for (const modifier of ['shiftKey', 'ctrlKey', 'metaKey']) {
      root.click()
      sibling.querySelector('.hash_title').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, [modifier]: true }))
      await settle()
      assert.deepEqual(selectedIds(document), ['sibling'])
      assert.equal(opens, 0)
      const before = toggles
      root.querySelector('.hash_title').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, [modifier]: true }))
      assert.equal(toggles, before + 1)
      action.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, [modifier]: true }))
      assert.deepEqual(selectedIds(document), ['root'])
    }
    assert.equal(actions, 3)
    sibling.click()
    assert.equal(opens, 1)
  } finally { dispose(); dom.window.close() }
})
