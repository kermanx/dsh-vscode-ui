import { readFile } from 'node:fs/promises'

/** Compile only the Codicons used by identified DSH action controls. */
export async function iconStyles() {
  const collection = JSON.parse(await readFile(new URL('../node_modules/@iconify-json/codicon/icons.json', import.meta.url), 'utf8'))
  const { icons } = collection
  const mappings = [
    ["[data-step-process] [data-process-activity][aria-expanded='false'] [data-step-process-chevron] svg", 'chevron-right'],
    ["[data-step-process] [data-process-activity][aria-expanded='true'] [data-step-process-chevron] svg", 'chevron-down'],
    ["[data-step-process] [data-slot='tool.call.toolview'] [aria-expanded='true'] > :--class(leading) > svg", 'chevron-down'],
    ["[data-slot='sidebar'] :--class(newSession) svg", 'new-session'],
    ["[data-slot='sidebar'] :--class(panelIcon)", 'layout-sidebar-left'],
    ["[data-slot='sidebar'] [data-slot='settings.trigger'] svg", 'settings-gear'],
    ["[data-slot='sidebar'] :--class(sectionHeader) :--class(searchButton) svg", 'search'],
    ["[data-slot='sidebar'] :--class(sectionHeader) :--class(clearButton) svg", 'close'],
    ["[data-slot='sidebar'] :--class(sectionHeader) :--class(headerActions) > span :--class(iconButton) svg", 'settings'],
    ["[data-slot='sidebar'] :--class(sectionHeader) :--class(headerActions) > :--class(iconButton):last-child svg", 'new-folder'],
    ["[data-composer-card] :--class(add) svg", 'add'],
    ["[data-composer-card] :--class(chevron)", 'chevron-down'],
    ["[data-phase='hero'] [data-slot='conversation.session.header.corner'] svg", 'layout-sidebar-right'],
    ["[data-shortcut-modal='settings'] :--class(close) svg", 'close'],
    ["[data-dockkit-tab-close] svg", 'close'],
    ["[data-dockkit-add-tab] svg", 'add'],
    ["[data-dockkit-split-button] svg", 'split-horizontal'],
    ["[data-dockkit-strip-chrome] [data-sidebar-right-mode='fullscreen'] svg", 'screen-full'],
    ["[data-dockkit-strip-chrome] [data-sidebar-right-mode='push'] svg", 'screen-normal'],
    ["[data-dockkit-strip-chrome] [data-sidebar-right-toggle] svg", 'layout-sidebar-right'],
    ["[data-dockkit-tab-title] :--class(folder)", 'folder'],
    ["[data-phase='hero'] :--class(folder)", 'folder'],
    ["[data-phase='hero'] :--class(chevron)", 'chevron-down'],
    [":--class(toBottom) svg", 'arrow-down'],
    ["[data-vsc-tree] [data-row-key^='workspace:'] :--class(chevron) svg", 'chevron-right'],
    ["[data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='true'] :--class(folder) svg", 'folder-opened'],
    ["[data-vsc-tree] [data-row-key^='workspace:'][aria-expanded='false'] :--class(folder) svg", 'folder'],
    ["[data-vsc-tree] [data-row-key='workspace:'][aria-expanded] :--class(folder) svg", 'folder-library'],
    ["[data-vsc-tree] :--class(rowActions) > span > button svg", 'ellipsis'],
    ["[data-vsc-tree] [data-row-key^='workspace:'] :--class(rowActions) > button svg", 'new-session'],
    ["[data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg", 'archive'],
    ["[data-vsc-tree] :--class(archived) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(1) svg", 'unarchive'],
    ["[data-vsc-tree] [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg", 'pin'],
    ["[data-vsc-tree] [data-row-key]:has(:--class(pinIndicator)) [data-slot='sidebar.workspaces.session.row.action'] > button:nth-of-type(2) svg", 'pinned'],
    ["[data-vsc-tree] :--class(pinIndicator) svg", 'pinned'],
    ["[data-vsc-tree] [data-row-key^='session:'] > :--class(slot):empty::after", 'comment'],
    ["[data-vsc-tree] [data-row-key^='session:'] > :--class(slot):has(> [data-slot]:empty)::after", 'comment'],
  ]
  const own = ['files', 'search', 'extensions', 'calendar', 'git-pull-request', 'checklist', 'new-file', 'layout-sidebar-left']
    .map(name => {
      const item = icons[name];
      if (!item) throw new Error(`Missing Codicon: ${name}`);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${item.width ?? collection.width ?? 16} ${item.height ?? collection.height ?? 16}">${item.body}</svg>`;
      return `.vsc-icon[data-icon="${name}"] { mask: url("data:image/svg+xml,${encodeURIComponent(svg)}") center / contain no-repeat; }`;
    }).join('\n');
  return own + '\n' + mappings.map(([selector, name]) => {
    const icon = icons[name]
    if (!icon) throw new Error(`Missing icon: ${name}`)
    const width = icon.width ?? collection.width ?? 16
    const height = icon.height ?? collection.height ?? 16
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${icon.body}</svg>`
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
    return `body ${selector} { ${selector.endsWith('::after') ? "content: ''; display: block;" : ''} width: ${selector.includes("settings.trigger") ? 24 : 16}px; height: ${selector.includes("settings.trigger") ? 24 : 16}px; background: currentColor; mask: ${url} center / contain no-repeat; }
${selector.endsWith('::after') ? '' : `body ${selector} > * { visibility: hidden; }`}`
  }).join('\n')
}
