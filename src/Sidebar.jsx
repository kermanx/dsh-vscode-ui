/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: ActivityBar, CompositeBar, SidebarTitle, WorkbenchLayout, ActionBar
 * Adaptation: React activity navigation and title toolbar around DSH's persistent session and panel slots, with view focus handoff.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

export function Icon({ name, size = 16 }) {
  return <span aria-hidden="true" className="vsc-icon" data-icon={name} style={{ width: size, height: size }} />
}
const panelIcons = { plugins: 'extensions', schedules: 'calendar', review: 'git-pull-request', tasks: 'checklist' }

export function Sidebar({ collapsed, sidePanels, usePanels, usePanelInfo, toggleSidebar, selectPanel, startSession, renderSlot, t }) {
  const panels = usePanels(value => value)
  const panel = usePanelInfo(value => value.activePanelId)
  const root = useRef(null)
  const activityButtons = useRef(new Map())
  const pendingViewFocus = useRef(null)
  const [focused, setFocused] = useState('explorer')
  const [titleFocus, setTitleFocus] = useState('newSession')
  const entries = [
    { id: 'explorer', label: t('explorer'), icon: 'files' },
    ...panels.map(p => ({ ...p, icon: panelIcons[p.id] })),
  ]
  const active = panel ?? 'explorer'
  const activeLabel = entries.find(entry => entry.id === active)?.label ?? t('explorer')
  const focusActivity = (id) => {
    setFocused(id)
    activityButtons.current.get(id)?.focus()
  }
  useLayoutEffect(() => {
    const container = root.current
    if (!container) return
    const activeElement = container.ownerDocument.activeElement
    // External commands can hide the currently focused view as well as collapse it.
    if (container.contains(activeElement) && activeElement.closest('[hidden]')) focusActivity(active)
    if (!collapsed && pendingViewFocus.current === active) {
      pendingViewFocus.current = null
      const view = panel === null ? container.querySelector('.vsc-workspace-view')
        : [...container.querySelectorAll('[data-side-panel]')].find(view => view.dataset.sidePanel === panel)
      const target = [...(view?.querySelectorAll('[tabindex="0"], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ?? [])]
        .find(element => !element.closest('[hidden], [inert]') && element.getAttribute('aria-hidden') !== 'true')
      target?.focus()
    }
  }, [collapsed, panel])
  const collapseExplorer = () => {
    focusActivity(active)
    toggleSidebar()
  }
  const activate = (id) => {
    focusActivity(id)
    if (id === active && !collapsed) { toggleSidebar(); return }
    pendingViewFocus.current = id
    if (id === 'explorer') {
      selectPanel(null)
      if (collapsed) toggleSidebar()
    } else {
      selectPanel(id)
    }
  }
  useEffect(() => {
    if (!entries.some(entry => entry.id === focused)) setFocused('explorer')
  }, [panels, focused])
  const keyboard = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const current = entries.findIndex(e => e.id === focused)
    let index
    if (event.key === 'ArrowDown') index = current + 1
    else if (event.key === 'ArrowUp') index = current - 1
    else if (event.key === 'Home') index = 0
    else if (event.key === 'End') index = entries.length - 1
    else return
    if (index < 0 || index >= entries.length) return
    event.preventDefault()
    event.stopPropagation()
    focusActivity(entries[index].id)
  }
  const titleKeyboard = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const buttons = [...event.currentTarget.querySelectorAll('button')]
    const current = buttons.indexOf(event.target)
    if (current < 0) return
    let index
    if (event.key === 'ArrowRight') index = (current + 1) % buttons.length
    else if (event.key === 'ArrowLeft') index = (current + buttons.length - 1) % buttons.length
    else if (event.key === 'Home') index = 0
    else if (event.key === 'End') index = buttons.length - 1
    else return
    event.preventDefault()
    event.stopPropagation()
    buttons[index].focus()
  }
  return <div ref={root} className="vsc-sidebar" data-collapsed={collapsed || undefined}>
    <div className="vsc-activitybar">
      <nav className="vsc-activities" aria-label={t('activityBar')} onKeyDown={keyboard}>
        {entries.map(entry => <Tooltip key={entry.id} label={entry.label} side="right" delayMs={500}>
          <button type="button" className="vsc-activity" data-activity-id={entry.id}
            ref={element => { if (element) activityButtons.current.set(entry.id, element); else activityButtons.current.delete(entry.id) }}
            aria-label={entry.label} aria-current={active === entry.id && !collapsed ? 'page' : undefined}
            tabIndex={focused === entry.id ? 0 : -1} onFocus={() => setFocused(entry.id)}
            onClick={() => activate(entry.id)}>
            {entry.icon ? <Icon name={entry.icon} size={24} /> : renderSlot('sidebar.panellist', { size: 24, active: active === entry.id && !collapsed }, { only: entry.id })}
            {entry.id === 'explorer' && renderSlot('sidebar.toggle.badge', {})}
          </button>
        </Tooltip>)}
      </nav>
      <div className="vsc-global-actions">
        {renderSlot('sidebar.footer.action', { wide: false })}
        {renderSlot('sidebar.settings', { wide: false })}
      </div>
    </div>
    <section className="vsc-explorer" aria-label={activeLabel} hidden={collapsed}>
      <header className="vsc-sidebar-title">
        <h2 title={activeLabel}>{activeLabel}</h2>
        <div className="vsc-title-actions" role="toolbar" aria-label={activeLabel} onKeyDown={titleKeyboard}>
          {panel === null && <Tooltip label={t('newSession')} delayMs={500}>
            <button type="button" className="vsc-action" aria-label={t('newSession')} tabIndex={titleFocus === 'newSession' ? 0 : -1}
              onFocus={() => setTitleFocus('newSession')} onClick={() => startSession()}><Icon name="new-file"/></button>
          </Tooltip>}
          <Tooltip label={t('collapse')} delayMs={500}>
            <button type="button" className="vsc-action" aria-label={t('collapse')} tabIndex={panel !== null || titleFocus === 'collapse' ? 0 : -1}
              onFocus={() => setTitleFocus('collapse')} onClick={collapseExplorer}><Icon name="layout-sidebar-left"/></button>
          </Tooltip>
        </div>
      </header>
      <div className="vsc-workspace-view" data-view="explorer" hidden={panel !== null}>
        {renderSlot('sidebar.workspaces', { wide: true, expandSidebar: () => { if (collapsed) toggleSidebar() } })}
      </div>
      {sidePanels}
    </section>
  </div>
}

/** Keep the host's caption controls available through its leading slot. */
export function LeadingControls({ toggleSidebar, startSession, t }) {
  return <div className="vsc-leading">
    <button type="button" className="vsc-action" aria-label={t('explorer')} onClick={toggleSidebar}><Icon name="layout-sidebar-left"/></button>
    <button type="button" className="vsc-action" aria-label={t('newSession')} onClick={() => startSession()}><Icon name="new-file"/></button>
  </div>
}
