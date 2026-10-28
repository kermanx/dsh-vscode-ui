/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: ActivityBar, TreeView, Theme, WorkbenchLayout
 * Adaptation: Reversible Cordis registration of a DSH Classic sidebar and native-control presentation.
 */
import { apply as applyLayout } from './layout/index.ts'
import frameStyles from './frame.css'
import { classicTokens } from './tokens.js'
import styles from './classic.css'
import { platformFonts } from './fonts.js'
import icons from 'classic:icons'
import treeStyles from './tree.css'
import activityStyles from './activity.css'
import assistantStyles from './assistant.css'
import processStyles from './process.css'
import dockStyles from './dock.css'
import { enhanceSidebarTree } from './tree.js'
import { enhanceViewTabs } from './tabs.js'
import { Sidebar, LeadingControls } from './Sidebar.jsx'
import { createPanelPins } from './panel-pins.js'

export const inject = ['theme', 'slots', 'locale', 'shortcuts']
const messages = {
  en: { explorer: 'Sessions', search: 'Search Sessions', activityBar: 'Activity Bar', newSession: 'New Session', collapse: 'Hide Side Bar', more: 'More' },
  zh: { explorer: '会话', search: '搜索会话', activityBar: '活动栏', newSession: '新建会话', collapse: '隐藏侧栏', more: '更多' },
}
function panelStore(ctx) {
  let snapshot = []
  const listeners = new Set()
  const sync = () => {
    snapshot = ctx.slots.entriesOfSlot('sidebar.panellist').map(({ options }) => ({
      id: options.id, label: typeof options.label === 'function' ? options.label() : options.label ?? options.id, order: options.order ?? 0,
    })).sort((a, b) => a.order - b.order)
    listeners.forEach(listener => listener())
  }
  return { sync, getSnapshot: () => snapshot, subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) } }
}
export function apply(ctx) {
  ctx.effect(() => ctx.theme.overrideTokens('dsh-vscode-ui', classicTokens))
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-vscode-ui'
    tag.textContent = [frameStyles, styles, treeStyles, assistantStyles, processStyles, dockStyles, activityStyles, icons, platformFonts(document)].join('\n')
    document.head.append(tag)
    return () => tag.remove()
  })
  ctx.effect(() => ctx.locale.register('vscode-ui', messages))
  applyLayout(ctx)
  ctx.inject(['layout', 'uiWorkspace'], ctx => {
    const panels = panelStore(ctx)
    const pins = createPanelPins()
    const entryActions = {
      getSnapshot: () => ctx.slots.entriesOfSlot('sidebar.panellist.actions').length > 0,
      subscribe: listener => ctx.slots.subscribe('sidebar.panellist.actions', listener),
    }
    const injectProps = () => ({
      startSession: workspaceId => ctx.get('uiWorkspace').startSession(workspaceId),
      toggleSidebar: () => ctx.layout.toggleSidebar(),
      selectPanel: id => ctx.layout.selectPanel(id),
      setPinned: pins.setPinned,
      hooks: { panels, entryPins: pins.unpinned, entryActions },
    })
    ctx.slots.inject('sidebar', () => ctx.slots.register({
      name: 'sidebar', locale: 'vscode-ui', inject: injectProps,
      children: {
        'sidebar.toggle.badge': { kind: 'single', scope: 'root' },
        'sidebar.panellist': { kind: 'list', scope: 'root' },
        'sidebar.panellist.actions': { kind: 'list', scope: 'root' },
        'sidebar.workspaces': { kind: 'single', scope: 'root' },
        'sidebar.settings': { kind: 'single', scope: 'root' },
        'sidebar.footer.action': { kind: 'list', scope: 'root' },
      },
    }, Sidebar))
    ctx.slots.inject('shell.leading', () => ctx.slots.register({ name: 'shell.leading', locale: 'vscode-ui', inject: injectProps }, LeadingControls))
    ctx.effect(() => ctx.slots.subscribe('sidebar.panellist', panels.sync))
    ctx.effect(() => ctx.locale.subscribe(panels.sync))
    panels.sync()
    ctx.effect(() => enhanceSidebarTree(document))
    ctx.effect(() => enhanceViewTabs(document))
  })
}
