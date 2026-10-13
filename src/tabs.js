/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: PanelTitle, CompositeBar
 * Adaptation: Reversible roving focus for conversation and trajectory inspector views; native buttons and DSH retain activation and selection.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
// Only these surfaces lack host keyboard navigation. DockKit, task details,
// plugin settings, and segmented choices already own their keyboard behavior.
const listSelector = '[data-conversation-tabs][role="tablist"], [role="tablist"]:has(> [role="tab"][id^="trajectory-detail-"])'
const tabSelector = '[role="tab"]'

/** Match CompositeBar's manual activation: arrows move focus, buttons select. */
export function enhanceViewTabs(document) {
  const view = document.defaultView
  if (!view) return () => {}
  const owned = new Map()
  let lists = new Map()
  let queued = false
  let disposed = false

  function setAttribute(element, name, value) {
    let attributes = owned.get(element)
    if (!attributes) owned.set(element, attributes = new Map())
    let record = attributes.get(name)
    if (!record) attributes.set(name, record = { before: element.getAttribute(name), value })
    record.value = value
    if (element.getAttribute(name) !== value) element.setAttribute(name, value)
  }

  function restore(element, attributes) {
    for (const [name, { before, value }] of attributes) {
      if (element.getAttribute(name) !== value) continue
      if (before === null) element.removeAttribute(name)
      else element.setAttribute(name, before)
    }
  }

  function refresh() {
    queued = false
    if (disposed) return
    const next = new Map()
    const retained = new Set()
    for (const list of document.querySelectorAll(listSelector)) {
      if (list.closest('[hidden], [inert], [aria-hidden="true"]')) continue
      const allTabs = [...list.querySelectorAll(tabSelector)].filter(tab => tab.closest(listSelector) === list
        && !tab.closest('[hidden], [inert], [aria-hidden="true"]'))
      if (!allTabs.length) continue
      const tabs = allTabs.filter(tab => !tab.matches(':disabled, [aria-disabled="true"]'))
      retained.add(list)
      setAttribute(list, 'aria-orientation', 'horizontal')
      const current = tabs.find(tab => tab === document.activeElement)
        ?? tabs.find(tab => tab.getAttribute('aria-selected') === 'true') ?? tabs[0]
      for (const tab of allTabs) {
        retained.add(tab)
        setAttribute(tab, 'tabindex', tab === current ? '0' : '-1')
      }
      next.set(list, tabs)
    }
    for (const [element, attributes] of owned) {
      if (retained.has(element)) continue
      restore(element, attributes)
      owned.delete(element)
    }
    lists = next
  }

  function schedule() {
    if (queued || disposed) return
    queued = true
    view.queueMicrotask(refresh)
  }

  function keydown(event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return
    const tab = event.target.closest?.(tabSelector)
    if (tab !== event.target) return
    const list = tab?.closest(listSelector)
    const tabs = lists.get(list)
    if (!tabs?.includes(tab)) return
    const index = tabs.indexOf(tab)
    let destination
    if (event.key === 'ArrowRight') destination = tabs[(index + 1) % tabs.length]
    else if (event.key === 'ArrowLeft') destination = tabs[(index - 1 + tabs.length) % tabs.length]
    else if (event.key === 'Home') destination = tabs[0]
    else if (event.key === 'End') destination = tabs.at(-1)
    else return
    event.preventDefault()
    event.stopPropagation()
    for (const item of tabs) setAttribute(item, 'tabindex', item === destination ? '0' : '-1')
    destination.focus({ preventScroll: true })
    destination.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  const affectsLists = element => element?.nodeType === 1
    && (lists.has(element) || element.matches(listSelector) || element.closest(listSelector) || element.querySelector(listSelector))
  const observer = new view.MutationObserver(records => {
    if (records.some(record => affectsLists(record.target)
      || [...record.addedNodes, ...record.removedNodes].some(affectsLists))) schedule()
  })
  observer.observe(document.body, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['aria-selected', 'disabled', 'aria-disabled', 'hidden', 'inert', 'aria-hidden'],
  })
  document.addEventListener('keydown', keydown)
  document.addEventListener('focusin', schedule)
  document.addEventListener('focusout', schedule)
  refresh()
  return () => {
    disposed = true
    observer.disconnect()
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('focusin', schedule)
    document.removeEventListener('focusout', schedule)
    for (const [element, attributes] of owned) restore(element, attributes)
    owned.clear()
    lists.clear()
  }
}
