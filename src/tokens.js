/*
 * UI reference skill: vscode-ui
 * Reference revision: 4378eb0b965339a354d357fcb5ae33d2e10bf20e
 * Reference components: Theme/createTheme, Theme/tokens.css, Dark 2026, Light 2026
 * Adaptation: Map semantic palettes and the used Classic geometry to DSH overrides, preserving optional-color fallbacks.
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT License.
 */
import palettes from './palettes.js'
const roles = {
  '--dsw-alias-bg-base': 'editor.background',
  '--dsw-alias-bg-document-preview': 'editor.background',
  '--dsw-specific-sidebar-fill': 'sideBar.background',
  '--dsw-alias-bg-layer-1': 'input.background',
  '--dsw-alias-bg-layer-2': 'sideBar.background',
  '--dsw-alias-bg-layer-3': 'sideBar.background',
  '--dsw-alias-bg-overlay': 'menu.background',
  '--dsw-specific-menu': 'menu.background',
  '--dsw-menu-surface-fill': 'menu.background',
  '--dsw-alias-menu-group-header-fill': 'menu.background',
  '--dsw-specific-input-major': 'input.background',
  '--dsw-alias-label-primary': 'foreground',
  '--dsw-alias-label-primary-dimmed': 'foreground',
  '--dsw-alias-label-primary-bluish': 'foreground',
  '--dsw-alias-menu-icon': 'icon.foreground',
  '--dsw-alias-label-secondary': 'descriptionForeground',
  '--dsw-alias-label-tertiary': 'descriptionForeground',
  '--dsw-alias-label-document-preview': 'foreground',
  '--dsw-alias-label-dimmed': 'disabledForeground',
  '--dsw-alias-label-caption': 'descriptionForeground',
  '--dsw-alias-border-l1': 'sideBar.border',
  '--dsw-alias-border-l2': 'panel.border',
  '--dsw-alias-border-l3': 'sideBar.border',
  '--dsw-alias-border-l4': 'input.border',
  '--dsw-alias-button-primary-fill': 'button.background',
  '--dsw-alias-state-business-primary': 'button.background',
  '--dsw-focus-ring-color': 'focusBorder',
  '--dsw-alias-button-primary-hover': 'button.hoverBackground',
  '--dsw-alias-label-primary-foreground': 'button.foreground',
  '--dsw-alias-link': 'textLink.foreground',
  '--dsw-alias-interactive-bg-hover': 'list.hoverBackground',
  '--dsw-alias-interactive-bg-hover-solid': 'list.hoverBackground',
  '--dsw-specific-sidebar-nav-item-hover': 'list.hoverBackground',
  '--dsw-alias-interactive-bg-active': 'list.activeSelectionBackground',
  '--dsw-specific-sidebar-nav-item-active': 'list.activeSelectionBackground',
  '--dsw-alias-button-elevated-fill': 'button.secondaryBackground',
  '--dsw-alias-button-floating-fill': 'button.secondaryBackground',
  '--dsw-alias-button-tool-bar-fill': 'button.secondaryBackground',
  '--dsw-specific-selector': 'dropdown.background',
  '--dsw-alias-button-floating-hover': 'toolbar.hoverBackground',
  '--dsw-alias-button-tool-bar-hover': 'toolbar.hoverBackground',
  '--dsw-alias-markdown-code-block': 'textCodeBlock.background',
  '--dsw-alias-markdown-code-block-banner': 'sideBar.background',
  '--dsw-specific-bubble': 'textCodeBlock.background',
  '--dsw-alias-toast-bg': 'notifications.background',
  '--dsw-alias-toast-label': 'notifications.foreground',
  '--vsc-list-selection': 'list.activeSelectionBackground',
  '--vsc-list-selection-foreground': 'list.activeSelectionForeground',
  '--vsc-list-inactive-selection': 'list.inactiveSelectionBackground',
  '--vsc-tree-guide': 'tree.indentGuidesStroke',
  '--vsc-tree-inactive-guide': 'tree.inactiveIndentGuidesStroke',
  '--vsc-tab-inactive-background': 'tab.inactiveBackground',
  '--vsc-tab-inactive-foreground': 'tab.inactiveForeground',
  '--vsc-terminal-background': 'terminal.background',
  '--vsc-terminal-foreground': 'terminal.foreground',
}
// The 2026 palettes inherit registered defaults for these omitted roles.
const defaults = {
  'tree.indentGuidesStroke': { light: '#a9a9a9', dark: '#585858' },
  'tree.inactiveIndentGuidesStroke': { light: '#a9a9a966', dark: '#58585866' },
  'toolbar.hoverBackground': { light: '#b8b8b850', dark: '#5a5d5e50' },
  'sash.hoverBorder': { light: '#0090f1', dark: '#007fd4' },
  'terminal.background': { light: palettes.light['editor.background'], dark: palettes.dark['editor.background'] },
  'radio.activeForeground': { light: '#000000', dark: '#ffffff' },
  'radio.activeBackground': { light: 'rgba(0, 144, 241, 0.2)', dark: 'rgba(0, 127, 212, 0.4)' },
  'radio.activeBorder': { light: '#007acc', dark: '#007acc' },
  'radio.inactiveBorder': { light: 'rgba(0, 0, 0, 0.2)', dark: 'rgba(255, 255, 255, 0.2)' },
  'radio.inactiveHoverBackground': { light: 'rgba(184, 184, 184, 0.31)', dark: 'rgba(90, 93, 94, 0.5)' },
  'editorHoverWidget.foreground': { light: '#616161', dark: '#cccccc' },
  'settings.textInputBackground': { light: '#ffffff', dark: '#3c3c3c' },
  'settings.textInputForeground': { light: '#616161', dark: '#cccccc' },
  'settings.numberInputBackground': { light: '#ffffff', dark: '#3c3c3c' },
  'settings.numberInputForeground': { light: '#616161', dark: '#cccccc' },
  'settings.dropdownForeground': { light: '#616161', dark: '#f0f0f0' },
  'settings.headerBorder': { light: 'rgba(128, 128, 128, 0.35)', dark: 'rgba(128, 128, 128, 0.35)' },
  'settings.settingsHeaderHoverForeground': { light: 'rgba(68, 68, 68, 0.7)', dark: 'rgba(231, 231, 231, 0.7)' },
}
const geometry = { 'cornerRadius.medium': '6px' }
function pair(role, fallback = 'transparent') {
  return Object.fromEntries(['light', 'dark'].map(mode => [mode, palettes[mode][role] ?? defaults[role]?.[mode] ?? fallback]))
}
export const classicTokens = Object.fromEntries([
  ...Object.entries(roles).map(([token, role]) => [token, pair(role)]),
  ...[...new Set([...Object.keys(palettes.light), ...Object.keys(palettes.dark), ...Object.keys(defaults)])]
    // An omitted optional color must leave var() fallbacks available. A
    // transparent color would suppress focused outlines in the other theme.
    .map(role => [`--vscode-${role.replaceAll('.', '-')}`, pair(role, 'initial')]),
  ...Object.entries(geometry).map(([role, value]) => [`--vscode-${role.replaceAll('.', '-')}`, { light: value, dark: value }]),
  ['--dsw-corner-shape', { light: 'round', dark: 'round' }],
  ['--dsw-focus-ring-width', { light: '1px', dark: '1px' }],
  ['--dsw-menu-backdrop-filter', { light: 'none', dark: 'none' }],
])
