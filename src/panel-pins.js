/*
 * DSH source: 353c550cac64c9bcb01a0f1c6f54bf4ea3cdfa94, packages/client/ui-sidebar.
 * Adaptation: in-memory pin choices for the Classic activity bar.
 * Copyright (c) 2026 DeepSeek. MIT License.
 */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'

export function createPanelPins() {
  const unpinned = createSnapshotStore([])
  return {
    unpinned,
    setPinned(id, pinned) {
      const current = unpinned.getSnapshot()
      if (id === 'plugins' || pinned !== current.includes(id)) return
      unpinned.set(pinned ? current.filter(entry => entry !== id) : [...current, id])
    },
  }
}
