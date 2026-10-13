/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: TreeView/useTree, ExplorerTree, List/useList
 * Adaptation: Independent selection and navigation focus, retained across DSH composer autofocus when the tree opens a session.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
const rowSelector = '[role="treeitem"], [data-row-key^="overflow:"]'
const groupSelector = '[style*="--dsh-workspace-indent"]'
const titleSelector = '[class$="_title"], [class*="_title "], [class^="_title_"], [class*=" _title_"], [class*="searchResultTitle"]'
const nativeClass = name => `:is([class$="_${name}"], [class*="_${name} "], [class^="_${name}_"], [class*=" _${name}_"])`
// Native Menu wraps its trigger in .root; Tooltip leaves ordinary row actions
// unwrapped. Never turn a context-menu key into an unarchive/new-session click.
const menuTriggerSelector = `button[aria-haspopup="menu"], button[aria-haspopup="true"], ${nativeClass('rowActions')} > ${nativeClass('root')} > button`

/** Adapt the existing rows without replacing native opening, expansion, or row actions. */
export function enhanceSidebarTree(document) {
  const view = document.defaultView
  if (!view) return () => {}
  const owned = new Map()
  let trees = new Map()
  const remembered = new WeakMap()
  const nativeRows = new WeakMap()
  const ownSelectionWrites = new WeakMap()
  const nativeChanges = new Set()
  let toggling
  let observer
  let scheduled = false
  let disposed = false
  let typed = ''
  let typedAt = 0
  let openFocus
  let restoringFocus = false

  // React owns the open-session marker. Keep it separate from the ARIA selection
  // we expose, and distinguish our writes from React's later mutations.
  function nativeRow(row) {
    let native = nativeRows.get(row)
    if (!native) {
      const aria = row.getAttribute('aria-selected')
      const selectedClass = row.matches(nativeClass('selected'))
      nativeRows.set(row, native = { aria, selectedClass, selected: selectedClass || aria === 'true' })
    }
    return native
  }

  function write(element, name, value) {
    const before = element.getAttribute(name)
    if (before === value) return
    if (name === 'aria-selected' && observer && document.body.contains(element)) {
      let writes = ownSelectionWrites.get(element)
      if (!writes) ownSelectionWrites.set(element, writes = [])
      writes.push({ before, value })
    }
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
  }

  function attr(element, name, value) {
    let entry = owned.get(element)
    if (!entry) owned.set(element, entry = new Map())
    let record = entry.get(name)
    if (!record) entry.set(name, record = { before: element.getAttribute(name), value })
    record.value = value
    write(element, name, value)
  }

  function restore(element, records) {
    for (const [name, { before, value }] of records) {
      if (element.getAttribute(name) !== value) continue
      write(element, name, before)
    }
  }

  const identity = row => row?.dataset.rowKey || row

  function select(tree, row) {
    const state = trees.get(tree)
    if (!state) return
    state.selected = identity(row)
    state.localSelection = true
    for (const item of state.rows) attr(item, 'aria-selected', String(identity(item) === state.selected))
  }

  function toggle(row) {
    // Native folder clicks also expand on label. Keyboard expansion must not
    // pass through the label-click selection path.
    toggling = row
    try { row.click() } finally { toggling = undefined }
  }

  function focus(tree, row, reveal = false) {
    if (!row) return
    const state = trees.get(tree)
    if (!state) return
    if (openFocus?.tree === tree) openFocus.awaitingReveal = false
    state.focused = row
    state.current = row
    for (const item of state.rows) {
      attr(item, 'tabindex', item === row ? '0' : '-1')
      attr(item, 'data-vsc-tree-focused', String(item === row))
    }
    row.focus({ preventScroll: true })
    if (reveal) row.scrollIntoView?.({ block: 'nearest' })
  }

  function refresh() {
    scheduled = false
    if (disposed) return
    readMutations(observer?.takeRecords() ?? [])
    const next = new Map()
    const alive = new Set()
    for (const tree of document.querySelectorAll('[data-slot="sidebar"] [role="tree"]')) {
      const rows = [...tree.querySelectorAll(rowSelector)].filter(row => !row.closest('[hidden], [inert], [aria-hidden="true"]'))
      if (!rows.length || tree.closest('[hidden], [inert], [aria-hidden="true"]')) continue
      alive.add(tree)
      attr(tree, 'data-vsc-tree', '')
      attr(tree, 'aria-multiselectable', 'false')
      attr(tree, 'tabindex', '-1')
      const groups = new Map(rows.filter(row => row.dataset.rowKey?.startsWith('workspace:'))
        .map(row => [row.closest(groupSelector), row]).filter(([group]) => group))
      const parents = new Map()
      const levels = new Map()
      for (const row of rows) {
        alive.add(row)
        nativeRow(row)
        if (row.dataset.rowKey?.startsWith('overflow:')) attr(row, 'role', 'treeitem')
        const group = row.closest(groupSelector)
        const parentGroup = groups.get(group) === row ? group?.parentElement.closest(groupSelector) : group
        parents.set(row, groups.get(parentGroup))
        let level = 1
        for (let ancestor = parentGroup; groups.has(ancestor); ancestor = ancestor.parentElement.closest(groupSelector)) level++
        levels.set(row, level)
        attr(row, 'aria-level', String(level))
      }
      const previous = remembered.get(tree)
      const nativeSelected = rows.find(row => nativeRow(row).selected)
      const nativeIdentity = identity(nativeSelected)
      const state = previous ?? { selected: nativeIdentity, nativeSelected: nativeIdentity, nativeRow: nativeSelected, localSelection: false }
      // Remounting the same current session, or revealing it after collapsing a
      // folder, is not a new selection. Only a changed native current session
      // may replace the user's local folder/row selection or cleared selection.
      if (nativeSelected && nativeIdentity !== state.nativeSelected) {
        if (state.nativeSelected !== undefined || !state.localSelection || nativeChanges.has(nativeSelected)) state.selected = nativeIdentity
        state.nativeSelected = nativeIdentity
      } else if (!nativeSelected && state.nativeRow && !nativeRow(state.nativeRow).selected) {
        state.nativeSelected = undefined
        state.selected = undefined
        state.nativeRow = undefined
      }
      if (nativeSelected) state.nativeRow = nativeSelected
      // Rows can be replaced by native workspace updates. Stable native keys retain
      // navigation focus without coupling it to the currently open session.
      const retain = row => rows.includes(row) ? row
        : row?.dataset.rowKey ? rows.find(item => item.dataset.rowKey === row.dataset.rowKey) : undefined
      const active = rows.find(row => row.contains(document.activeElement))
      const focused = active ?? retain(previous?.focused)
      const current = focused ?? retain(previous?.current)
        ?? rows.find(row => row.tabIndex === 0)
        ?? rows.find(row => identity(row) === state.selected) ?? rows[0]
      // An action/input inside a row has its own focus treatment. Like the
      // reference tree's :focus (not :focus-within), it deactivates selection.
      attr(tree, 'data-vsc-tree-active', String(active === document.activeElement || tree === document.activeElement))
      const siblingGroups = new Map()
      for (const row of rows) {
        const parent = parents.get(row)
        if (!siblingGroups.has(parent)) siblingGroups.set(parent, [])
        siblingGroups.get(parent).push(row)
      }
      for (const row of rows) {
        attr(row, 'aria-selected', String(identity(row) === state.selected))
        attr(row, 'tabindex', row === current ? '0' : '-1')
        attr(row, 'data-vsc-tree-focused', String(row === focused))
        const siblings = siblingGroups.get(parents.get(row))
        attr(row, 'aria-posinset', String(siblings.indexOf(row) + 1))
        attr(row, 'aria-setsize', String(siblings.length))
      }
      const guideOwners = new Set(rows
        .filter(row => row === focused || row.getAttribute('aria-selected') === 'true')
        .map(row => row.getAttribute('aria-expanded') === 'true' ? row : parents.get(row)))
      for (const [group, row] of groups) {
        alive.add(group)
        attr(group, 'data-vsc-tree-group', guideOwners.has(row) ? 'active' : 'inactive')
      }
      Object.assign(state, { rows, parents, levels, focused, current })
      next.set(tree, state)
      remembered.set(tree, state)
    }
    for (const button of document.querySelectorAll('[data-slot="sidebar"] button[class$="_newSession"], [data-slot="sidebar"] button[class*="_newSession "]')) {
      alive.add(button)
      if (button.hasAttribute('aria-label')) attr(button, 'title', button.getAttribute('aria-label'))
    }
    for (const [element, records] of owned) {
      if (!alive.has(element)) { restore(element, records); owned.delete(element) }
    }
    trees = next
    nativeChanges.clear()
    if (openFocus) {
      const state = trees.get(openFocus.tree)
      if (openFocus.key && state?.nativeSelected === openFocus.key) openFocus.previous = undefined
      if (openFocus.awaitingReveal && state?.nativeRow && document.activeElement === openFocus.tree) {
        openFocus.key = identity(state.nativeRow)
        openFocus.previous = undefined
        focus(openFocus.tree, state.nativeRow)
      }
    }
  }

  function schedule() {
    if (scheduled || disposed) return
    scheduled = true
    view.queueMicrotask(refresh)
  }

  // DSH's InputBar focuses its editor in an effect on every session switch and
  // later unlock. Explorer opens preserve tree focus. Retain that intent until
  // the user leaves, instead of racing the effect with a timeout or RAF.
  function focusin(event) {
    if (restoringFocus) return
    if (openFocus && event.target.matches?.('[data-composer-input]')) {
      refresh()
      const tree = trees.has(openFocus.tree) ? openFocus.tree : [...trees.keys()][0]
      const state = trees.get(tree)
      const nativeKey = identity(state?.nativeRow)
      if (state && (!openFocus.key || !nativeKey || nativeKey === openFocus.key || nativeKey === openFocus.previous)) {
        const sameTree = tree === openFocus.tree
        const row = sameTree ? state.current : state.nativeRow ?? state.current
        openFocus.tree = tree
        if (!sameTree && nativeKey) openFocus.key = nativeKey
        restoringFocus = true
        try {
          if ((!sameTree || openFocus.awaitingReveal) && !state.nativeRow) {
            openFocus.awaitingReveal = true
            tree.focus({ preventScroll: true })
          } else focus(tree, row)
        } finally { restoringFocus = false }
        schedule()
        return
      }
      openFocus = undefined
    } else if (openFocus && !event.target.matches?.('[data-vsc-tree], [data-vsc-tree] [role="treeitem"]')) {
      openFocus = undefined
    }
    schedule()
  }

  function releaseOpenFocus(event) {
    if (event.type === 'pointerdown' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || !event.target.matches?.('[data-vsc-tree], [data-vsc-tree] [role="treeitem"]')
      || !(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Escape', ' '].includes(event.key) || event.key.length === 1)) {
      openFocus = undefined
    }
  }

  function keydown(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return
    const tree = event.target.closest?.('[data-vsc-tree]')
    const state = trees.get(tree)
    if (!state) return
    const row = event.target === tree ? state.focused : event.target.closest?.(rowSelector)
    if (event.target !== tree && (!row || event.target !== row)) return
    const { rows, parents, levels } = state
    const index = rows.indexOf(row)
    let destination
    switch (event.key) {
      case 'ArrowDown': destination = rows[Math.min(index + 1, rows.length - 1)]; break
      case 'ArrowUp': destination = rows[index < 0 ? 0 : Math.max(index - 1, 0)]; break
      case 'Home': destination = rows[0]; break
      case 'End': destination = rows.at(-1); break
      case 'ArrowRight':
        if (row?.getAttribute('aria-expanded') === 'false') toggle(row)
        else if (row && levels.get(rows[index + 1]) > levels.get(row)) destination = rows[index + 1]
        break
      case 'ArrowLeft':
        if (row?.getAttribute('aria-expanded') === 'true') toggle(row)
        else destination = parents.get(row)
        break
      case 'Enter':
        select(tree, row)
        if (row && !row.hasAttribute('aria-expanded') && !event.shiftKey) row.click()
        break
      case ' ': if (row?.hasAttribute('aria-expanded')) toggle(row); break
      case 'Escape':
        if (state.selected === undefined) return
        select(tree)
        break
      case 'PageDown': case 'PageUp': {
        const viewport = tree.clientHeight || tree.parentElement?.clientHeight || 220
        const rowHeight = row?.getBoundingClientRect().height || 22
        const delta = Math.max(1, Math.floor(viewport / rowHeight) - 1) * (event.key === 'PageDown' ? 1 : -1)
        destination = rows[Math.max(0, Math.min(rows.length - 1, index + delta))]
        break
      }
      case 'ContextMenu':
      case 'F10':
        if (event.key === 'F10' && !event.shiftKey) return
        const trigger = row?.querySelector(menuTriggerSelector)
        if (!trigger) return
        // Menu's native keyboard handler tracks focus within its anchor; focus
        // the trigger before opening so its arrows and Escape own the popup.
        trigger.focus({ preventScroll: true })
        trigger.click()
        break
      default: {
        if (event.key.length !== 1) return
        const now = Date.now()
        typed = now - typedAt > 800 ? event.key : typed + event.key
        typedAt = now
        const candidates = [...rows.slice(index + 1), ...rows.slice(0, index + 1)]
        destination = candidates.find(item => (item.querySelector(titleSelector)?.textContent ?? item.textContent).trim().toLocaleLowerCase().startsWith(typed.toLocaleLowerCase()))
      }
    }
    event.preventDefault()
    event.stopPropagation()
    if (destination) focus(tree, destination, true)
    schedule()
  }

  function pointerdown(event) {
    const row = event.target.closest?.(rowSelector)
    const control = event.target.closest?.('button, input, a, textarea, select, [contenteditable="true"]')
    if (!row || (control && control !== row) || event.target.closest?.(nativeClass('rowActions'))) return
    const tree = row.closest('[data-vsc-tree]')
    if (trees.has(tree)) focus(tree, row)
  }

  function click(event) {
    if (event.button !== 0) return
    const row = event.target.closest?.(rowSelector)
    const control = event.target.closest?.('button, input, a, textarea, select, [contenteditable="true"]')
    if ((control && control !== row) || event.target.closest?.(nativeClass('rowActions'))) return
    // The native tree can be shorter than its flex viewport; its empty bottom
    // area is part of the same tree interaction surface.
    const tree = event.target.closest?.('[data-vsc-tree]')
      ?? event.target.closest?.(nativeClass('treeBody'))?.querySelector('[data-vsc-tree]')
    const state = trees.get(tree)
    if (!state || toggling === row) return
    if (!row) {
      select(tree)
      state.focused = undefined
      for (const item of state.rows) attr(item, 'data-vsc-tree-focused', 'false')
      tree.focus({ preventScroll: true })
    } else {
      focus(tree, row)
      if (!event.target.closest(nativeClass('chevron'))) select(tree, row)
      // Explorer's caller opens ordinary leaf clicks; selection modifiers do
      // not open a session, even though this tree intentionally uses single select.
      if (!row.hasAttribute('aria-expanded') && (event.shiftKey || event.ctrlKey || event.metaKey)) event.stopPropagation()
      else if (!row.hasAttribute('aria-expanded') && !row.dataset.rowKey?.startsWith('overflow:') && !row.matches(nativeClass('archived'))) {
        openFocus = { tree, key: row.dataset.rowKey, previous: state.nativeSelected }
      }
    }
    schedule()
  }

  function readMutations(records) {
    let changed = false
    // A batch may include several writes to one attribute. Its next oldValue
    // gives each record's actual new value; the final DOM alone cannot do so.
    const later = new Map()
    const values = new Map()
    for (const record of [...records].reverse()) {
      if (record.type !== 'attributes') continue
      let attributes = later.get(record.target)
      if (!attributes) later.set(record.target, attributes = new Map())
      values.set(record, attributes.has(record.attributeName) ? attributes.get(record.attributeName) : record.target.getAttribute(record.attributeName))
      attributes.set(record.attributeName, record.oldValue)
    }
    for (const record of records) {
      const row = record.target
      if (record.type === 'attributes' && record.attributeName === 'aria-selected') {
        const value = values.get(record)
        const writes = ownSelectionWrites.get(row)
        if (writes?.[0]?.before === record.oldValue && writes[0].value === value) { writes.shift(); continue }
        if (!row.matches?.(rowSelector) || (!nativeRows.has(row) && !row.closest('[data-slot="sidebar"]'))) continue
        const native = nativeRow(row)
        native.aria = value
        native.selected = value === 'true'
        const ownedAria = owned.get(row)?.get('aria-selected')
        if (ownedAria) ownedAria.before = value
        nativeChanges.add(row)
      } else if (record.type === 'attributes' && record.attributeName === 'class') {
        if (!row.matches?.(rowSelector) || (!nativeRows.has(row) && !row.closest('[data-slot="sidebar"]'))) continue
        const native = nativeRow(row)
        const selectedClass = (values.get(record) ?? '').split(/\s+/).some(value => /(?:^|_)selected(?:_|$)/.test(value))
        if (selectedClass === native.selectedClass) continue
        native.selectedClass = selectedClass
        native.selected = selectedClass
        nativeChanges.add(row)
      }
      if (row.closest?.('[data-slot="sidebar"]')
        || [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('[data-slot="sidebar"]') || node.querySelector('[data-slot="sidebar"]')))) changed = true
    }
    return changed
  }

  observer = new view.MutationObserver(records => { if (readMutations(records)) schedule() })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['aria-selected', 'aria-expanded', 'class', 'hidden'] })
  document.addEventListener('keydown', keydown)
  document.addEventListener('keydown', releaseOpenFocus, true)
  document.addEventListener('pointerdown', releaseOpenFocus, true)
  document.addEventListener('pointerdown', pointerdown)
  document.addEventListener('click', click, true)
  document.addEventListener('focusin', focusin, true)
  document.addEventListener('focusout', schedule)
  refresh()
  return () => {
    disposed = true
    readMutations(observer.takeRecords())
    observer.disconnect()
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('keydown', releaseOpenFocus, true)
    document.removeEventListener('pointerdown', releaseOpenFocus, true)
    document.removeEventListener('pointerdown', pointerdown)
    document.removeEventListener('click', click, true)
    document.removeEventListener('focusin', focusin, true)
    document.removeEventListener('focusout', schedule)
    for (const [element, records] of owned) restore(element, records)
    owned.clear()
    trees.clear()
    openFocus = undefined
  }
}
